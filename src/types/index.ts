export interface CryptoTicker {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  total: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  pnl?: number;
  signalSource?: string;
}

export interface TradeSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  timestamp: number;
  indicators: {
    rsi: number;
    macd: string;
    ema: string;
    volume: string;
    trend: string;
  };
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface EmailConfig {
  email: string;
  enabled: boolean;
  alertTypes: {
    tradeSignals: boolean;
    priceAlerts: boolean;
    portfolioUpdates: boolean;
  };
}

export type TabType = 'dashboard' | 'chart' | 'trades' | 'signals' | 'settings';
