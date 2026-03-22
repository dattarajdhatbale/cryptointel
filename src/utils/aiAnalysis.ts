import { KlineData, TradeSignal } from '../types';

function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  ema[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }
  return ema;
}

function calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine.slice(-9), 9);
  
  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  
  return { macd, signal, histogram: macd - signal };
}

function calculateBollingerBands(closes: number[], period: number = 20): { upper: number; middle: number; lower: number } {
  if (closes.length < period) {
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    return { upper: avg * 1.02, middle: avg, lower: avg * 0.98 };
  }
  
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: mean + 2 * stdDev,
    middle: mean,
    lower: mean - 2 * stdDev,
  };
}

function calculateVolumeProfile(klines: KlineData[]): string {
  if (klines.length < 5) return 'NEUTRAL';
  const recentVol = klines.slice(-5).reduce((s, k) => s + k.volume, 0) / 5;
  const avgVol = klines.reduce((s, k) => s + k.volume, 0) / klines.length;
  
  if (recentVol > avgVol * 1.5) return 'HIGH';
  if (recentVol < avgVol * 0.5) return 'LOW';
  return 'NORMAL';
}

function detectTrend(closes: number[]): string {
  if (closes.length < 20) return 'SIDEWAYS';
  
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  
  const lastEma9 = ema9[ema9.length - 1];
  const lastEma21 = ema21[ema21.length - 1];
  
  const crossDiff = ((lastEma9 - lastEma21) / lastEma21) * 100;
  
  if (crossDiff > 0.5) return 'BULLISH';
  if (crossDiff < -0.5) return 'BEARISH';
  return 'SIDEWAYS';
}

export function generateTradeSignal(symbol: string, klines: KlineData[]): TradeSignal | null {
  if (klines.length < 30) return null;
  
  const closes = klines.map(k => k.close);
  const currentPrice = closes[closes.length - 1];
  
  const rsi = calculateRSI(closes);
  const macdData = calculateMACD(closes);
  const bb = calculateBollingerBands(closes);
  const volumeProfile = calculateVolumeProfile(klines);
  const trend = detectTrend(closes);
  
  let score = 0;
  const reasons: string[] = [];
  
  // RSI Analysis
  if (rsi < 30) { score += 2; reasons.push(`RSI oversold at ${rsi.toFixed(1)}`); }
  else if (rsi < 40) { score += 1; reasons.push(`RSI approaching oversold at ${rsi.toFixed(1)}`); }
  else if (rsi > 70) { score -= 2; reasons.push(`RSI overbought at ${rsi.toFixed(1)}`); }
  else if (rsi > 60) { score -= 1; reasons.push(`RSI approaching overbought at ${rsi.toFixed(1)}`); }
  
  // MACD Analysis
  if (macdData.histogram > 0 && macdData.macd > macdData.signal) {
    score += 1; reasons.push('MACD bullish crossover');
  } else if (macdData.histogram < 0 && macdData.macd < macdData.signal) {
    score -= 1; reasons.push('MACD bearish crossover');
  }
  
  // Bollinger Bands
  if (currentPrice < bb.lower) {
    score += 2; reasons.push('Price below lower Bollinger Band');
  } else if (currentPrice > bb.upper) {
    score -= 2; reasons.push('Price above upper Bollinger Band');
  }
  
  // Trend
  if (trend === 'BULLISH') { score += 1; reasons.push('Uptrend detected (EMA crossover)'); }
  else if (trend === 'BEARISH') { score -= 1; reasons.push('Downtrend detected (EMA crossover)'); }
  
  // Volume
  if (volumeProfile === 'HIGH') { reasons.push('High volume confirms momentum'); }
  
  let action: 'BUY' | 'SELL' | 'HOLD';
  let confidence: number;
  
  if (score >= 3) { action = 'BUY'; confidence = Math.min(95, 60 + score * 7); }
  else if (score >= 1) { action = 'BUY'; confidence = 40 + score * 10; }
  else if (score <= -3) { action = 'SELL'; confidence = Math.min(95, 60 + Math.abs(score) * 7); }
  else if (score <= -1) { action = 'SELL'; confidence = 40 + Math.abs(score) * 10; }
  else { action = 'HOLD'; confidence = 50; }
  
  const volatility = (bb.upper - bb.lower) / bb.middle;
  const targetMultiplier = action === 'BUY' ? 1 + volatility : 1 - volatility;
  const stopLossMultiplier = action === 'BUY' ? 1 - volatility * 0.5 : 1 + volatility * 0.5;
  
  return {
    id: `${symbol}-${Date.now()}`,
    symbol,
    action,
    confidence,
    reasoning: reasons.join('. ') + '.',
    targetPrice: Number((currentPrice * targetMultiplier).toFixed(2)),
    stopLoss: Number((currentPrice * stopLossMultiplier).toFixed(2)),
    currentPrice,
    timestamp: Date.now(),
    indicators: {
      rsi: Number(rsi.toFixed(2)),
      macd: macdData.histogram > 0 ? 'BULLISH' : 'BEARISH',
      ema: trend,
      volume: volumeProfile,
      trend,
    },
  };
}

export function calculatePortfolioMetrics(trades: { type: string; total: number; pnl?: number }[]) {
  const totalInvested = trades.filter(t => t.type === 'BUY').reduce((s, t) => s + t.total, 0);
  const totalSold = trades.filter(t => t.type === 'SELL').reduce((s, t) => s + t.total, 0);
  const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
  const totalClosedTrades = trades.filter(t => t.pnl !== undefined).length;
  
  return {
    totalInvested,
    totalSold,
    totalPnL,
    winRate: totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0,
    totalTrades: trades.length,
  };
}
