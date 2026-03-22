import { useState, useEffect, useCallback } from 'react';
import { getSymbolName, TRACKED_SYMBOLS, formatPrice } from '../hooks/useBinanceData';
import { generateTradeSignal } from '../utils/aiAnalysis';
import { useTradeContext } from '../context/TradeContext';
import { TradeSignal } from '../types';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertTriangle,
  Target,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export default function TradeSignals() {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(TRACKED_SYMBOLS.slice(0, 6));
  const { addTrade, emailConfig, addNotification } = useTradeContext();

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    const newSignals: TradeSignal[] = [];

    for (const symbol of selectedSymbols) {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`
        );
        const data = await response.json();
        const klines = data.map((k: any[]) => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));

        const signal = generateTradeSignal(symbol, klines);
        if (signal) newSignals.push(signal);
      } catch (err) {
        console.error(`Error analyzing ${symbol}:`, err);
      }
    }

    setSignals(newSignals);
    setLoading(false);

    // Check for strong signals and send notification
    const strongSignals = newSignals.filter(s => s.confidence >= 70 && s.action !== 'HOLD');
    if (strongSignals.length > 0 && emailConfig.enabled && emailConfig.alertTypes.tradeSignals) {
      sendEmailNotification(strongSignals);
    }
  }, [selectedSymbols, emailConfig]);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const sendEmailNotification = async (strongSignals: TradeSignal[]) => {
    try {
      // Using EmailJS for client-side email sending
      const emailjs = await import('@emailjs/browser');
      
      const signalSummary = strongSignals.map(s =>
        `${s.action} ${getSymbolName(s.symbol)} @ $${formatPrice(s.currentPrice)} (Confidence: ${s.confidence}%)`
      ).join('\n');

      await emailjs.send(
        'service_demo',
        'template_demo',
        {
          to_email: emailConfig.email,
          subject: `🚨 CryptoIntel Alert: ${strongSignals.length} Strong Signal(s)`,
          message: `AI Trade Signals Detected:\n\n${signalSummary}\n\nCheck your CryptoIntel dashboard for details.`,
        },
        'demo_public_key'
      );

      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: `Trade alert sent to ${emailConfig.email}`,
      });
    } catch (err) {
      // EmailJS requires proper configuration - show notification instead
      addNotification({
        type: 'info',
        title: 'Trade Alert',
        message: `${strongSignals.length} strong signal(s) detected! Configure EmailJS in settings for email alerts.`,
      });
    }
  };

  const handleExecuteSignal = (signal: TradeSignal) => {
    if (signal.action === 'HOLD') return;
    addTrade({
      symbol: signal.symbol,
      type: signal.action,
      price: signal.currentPrice,
      quantity: signal.action === 'BUY'
        ? Math.max(0.001, Number((100 / signal.currentPrice).toFixed(6)))
        : Math.max(0.001, Number((50 / signal.currentPrice).toFixed(6))),
      total: signal.action === 'BUY' ? 100 : 50,
      status: 'OPEN',
      signalSource: 'AI Signal',
    });
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp size={16} />;
      case 'SELL': return <TrendingDown size={16} />;
      default: return <Minus size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Trade Signals</h2>
              <p className="text-gray-500 text-xs">Powered by RSI, MACD, EMA, Bollinger Bands analysis</p>
            </div>
          </div>
          <button
            onClick={fetchSignals}
            disabled={loading}
            className="flex items-center gap-2 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Refresh Signals'}
          </button>
        </div>

        {/* Symbol Filter */}
        <div className="flex flex-wrap gap-2">
          {TRACKED_SYMBOLS.map(symbol => (
            <button
              key={symbol}
              onClick={() => toggleSymbol(symbol)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedSymbols.includes(symbol)
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                  : 'bg-[#1a1f2e] text-gray-500 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {getSymbolName(symbol)}
            </button>
          ))}
        </div>
      </div>

      {/* Signals Grid */}
      {loading && signals.length === 0 ? (
        <div className="bg-[#111827] rounded-xl border border-gray-800 p-20 text-center">
          <Brain size={48} className="text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">AI is analyzing market data...</p>
          <p className="text-gray-600 text-sm mt-1">Scanning technical indicators across {selectedSymbols.length} pairs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals
            .sort((a, b) => b.confidence - a.confidence)
            .map(signal => (
              <div
                key={signal.id}
                className={`bg-[#111827] rounded-xl border overflow-hidden ${
                  signal.confidence >= 70 ? 'border-yellow-400/30' : 'border-gray-800'
                }`}
              >
                {/* Signal Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{getSymbolName(signal.symbol)}</span>
                      <span className="text-gray-500 text-xs">/ USDT</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold border ${getActionColor(signal.action)}`}>
                      {getActionIcon(signal.action)}
                      {signal.action}
                    </span>
                  </div>
                  <div className="text-white text-xl font-mono">${formatPrice(signal.currentPrice)}</div>
                </div>

                {/* Confidence */}
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-xs">AI Confidence</span>
                    <span className={`font-bold text-sm ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        signal.confidence >= 70 ? 'bg-green-500' :
                        signal.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Indicators */}
                <div className="px-4 py-3 grid grid-cols-2 gap-2">
                  <Indicator label="RSI" value={signal.indicators.rsi.toString()} />
                  <Indicator label="MACD" value={signal.indicators.macd} />
                  <Indicator label="Trend" value={signal.indicators.trend} />
                  <Indicator label="Volume" value={signal.indicators.volume} />
                </div>

                {/* Targets */}
                <div className="px-4 py-2 flex gap-3 text-xs border-t border-gray-800/50">
                  <div className="flex items-center gap-1">
                    <Target size={12} className="text-green-400" />
                    <span className="text-gray-500">Target:</span>
                    <span className="text-green-400 font-mono">${formatPrice(signal.targetPrice)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldAlert size={12} className="text-red-400" />
                    <span className="text-gray-500">Stop:</span>
                    <span className="text-red-400 font-mono">${formatPrice(signal.stopLoss)}</span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="px-4 py-2 border-t border-gray-800/50">
                  <p className="text-gray-400 text-xs leading-relaxed">{signal.reasoning}</p>
                </div>

                {/* Action Button */}
                {signal.action !== 'HOLD' && (
                  <div className="p-3 border-t border-gray-800">
                    <button
                      onClick={() => handleExecuteSignal(signal)}
                      className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                        signal.action === 'BUY'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      <Zap size={14} />
                      Execute {signal.action} Signal
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {signals.length > 0 && !loading && (
        <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-medium text-sm">Disclaimer</span>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">
            AI-generated trade signals are for informational purposes only and do not constitute financial advice.
            Always conduct your own research (DYOR) before making any investment decisions. Past performance
            does not guarantee future results. Trading cryptocurrencies involves substantial risk of loss.
          </p>
        </div>
      )}
    </div>
  );
}

function Indicator({ label, value }: { label: string; value: string }) {
  const getValueColor = (v: string) => {
    const lower = v.toLowerCase();
    if (['bullish', 'high'].includes(lower) || parseFloat(v) < 30) return 'text-green-400';
    if (['bearish', 'low'].includes(lower) || parseFloat(v) > 70) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-[#0d1117] rounded-lg px-2 py-1.5">
      <div className="text-gray-600 text-[10px] uppercase tracking-wider">{label}</div>
      <div className={`text-xs font-medium ${getValueColor(value)}`}>{value}</div>
    </div>
  );
}
