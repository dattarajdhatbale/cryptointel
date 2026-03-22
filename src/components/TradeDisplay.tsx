import { useState } from 'react';
import { useTradeContext } from '../context/TradeContext';
import { useTickers, formatPrice, getSymbolName, TRACKED_SYMBOLS } from '../hooks/useBinanceData';
import { calculatePortfolioMetrics } from '../utils/aiAnalysis';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Percent,
  PlusCircle,
} from 'lucide-react';

export default function TradeDisplay() {
  const { trades, addTrade, closeTrade, removeTrade } = useTradeContext();
  const { tickers } = useTickers();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: 'BTCUSDT',
    type: 'BUY' as 'BUY' | 'SELL',
    quantity: '',
    price: '',
  });

  const metrics = calculatePortfolioMetrics(trades);

  const getCurrentPrice = (symbol: string): number => {
    const ticker = tickers.find(t => t.symbol === symbol);
    return ticker ? parseFloat(ticker.price) : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price) || getCurrentPrice(formData.symbol);
    const quantity = parseFloat(formData.quantity);
    if (!quantity || !price) return;

    addTrade({
      symbol: formData.symbol,
      type: formData.type,
      price,
      quantity,
      total: price * quantity,
      status: 'OPEN',
      signalSource: 'Manual',
    });

    setFormData({ symbol: 'BTCUSDT', type: 'BUY', quantity: '', price: '' });
    setShowForm(false);
  };

  const handleClose = (tradeId: string, symbol: string) => {
    const price = getCurrentPrice(symbol);
    if (price > 0) {
      closeTrade(tradeId, price);
    }
  };

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<DollarSign size={18} />}
          label="Total Invested"
          value={`$${metrics.totalInvested.toFixed(2)}`}
          color="blue"
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Total P&L"
          value={`${metrics.totalPnL >= 0 ? '+' : ''}$${metrics.totalPnL.toFixed(2)}`}
          color={metrics.totalPnL >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          icon={<Percent size={18} />}
          label="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          color="yellow"
        />
        <MetricCard
          icon={<Target size={18} />}
          label="Open Trades"
          value={`${openTrades.length}`}
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle size={18} />}
          label="Total Trades"
          value={`${metrics.totalTrades}`}
          color="gray"
        />
      </div>

      {/* New Trade Button & Form */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <PlusCircle size={20} className="text-yellow-400" />
            Place Trade
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              showForm
                ? 'bg-gray-700 text-gray-300'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Trade'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800 bg-[#0d1117]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Symbol</label>
                <select
                  value={formData.symbol}
                  onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                >
                  {TRACKED_SYMBOLS.map(s => (
                    <option key={s} value={s}>{getSymbolName(s)}/USDT</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'BUY' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      formData.type === 'BUY'
                        ? 'bg-green-500 text-white'
                        : 'bg-[#1a1f2e] text-gray-400 border border-gray-700'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'SELL' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      formData.type === 'SELL'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#1a1f2e] text-gray-400 border border-gray-700'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">
                  Price (USD){' '}
                  <button
                    type="button"
                    onClick={() => {
                      const p = getCurrentPrice(formData.symbol);
                      if (p) setFormData({ ...formData, price: p.toString() });
                    }}
                    className="text-yellow-400 hover:underline"
                  >
                    [Market]
                  </button>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder={`${getCurrentPrice(formData.symbol) || 'Enter price'}`}
                  className="w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.001"
                  className="w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-black py-2 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
                >
                  Execute Trade
                </button>
              </div>
            </div>
            {formData.price && formData.quantity && (
              <div className="mt-2 text-gray-400 text-xs">
                Total: ${(parseFloat(formData.price) * parseFloat(formData.quantity)).toFixed(2)} USDT
              </div>
            )}
          </form>
        )}
      </div>

      {/* Open Trades */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Open Positions ({openTrades.length})
          </h2>
        </div>
        {openTrades.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p>No open positions. Place a trade to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Pair</th>
                  <th className="text-right px-4 py-3">Entry Price</th>
                  <th className="text-right px-4 py-3">Current</th>
                  <th className="text-right px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">P&L</th>
                  <th className="text-right px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map(trade => {
                  const currentPrice = getCurrentPrice(trade.symbol);
                  const unrealizedPnL = trade.type === 'BUY'
                    ? (currentPrice - trade.price) * trade.quantity
                    : (trade.price - currentPrice) * trade.quantity;
                  const pnlPercent = (unrealizedPnL / trade.total) * 100;

                  return (
                    <tr key={trade.id} className="border-t border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {trade.type === 'BUY' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-sm">{getSymbolName(trade.symbol)}/USDT</td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm">${formatPrice(trade.price)}</td>
                      <td className="px-4 py-3 text-right text-white font-mono text-sm">
                        {currentPrice > 0 ? `$${formatPrice(currentPrice)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 text-sm">{trade.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 text-xs">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleClose(trade.id, trade.symbol)}
                            className="text-xs bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 px-2 py-1 rounded transition"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => removeTrade(trade.id)}
                            className="text-gray-500 hover:text-red-400 p-1 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Trades */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            Trade History ({closedTrades.length})
          </h2>
        </div>
        {closedTrades.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p>No closed trades yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Pair</th>
                  <th className="text-right px-4 py-3">Entry</th>
                  <th className="text-right px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-right px-4 py-3">P&L</th>
                  <th className="text-right px-4 py-3">Result</th>
                  <th className="text-right px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map(trade => (
                  <tr key={trade.id} className="border-t border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{getSymbolName(trade.symbol)}/USDT</td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm">${formatPrice(trade.price)}</td>
                    <td className="px-4 py-3 text-right text-gray-300 text-sm">{trade.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-300 text-sm">${trade.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(trade.pnl || 0) >= 0 ? (
                        <CheckCircle size={16} className="text-green-400 inline" />
                      ) : (
                        <XCircle size={16} className="text-red-400 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeTrade(trade.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-400/10 to-blue-400/5 border-blue-400/20 text-blue-400',
    green: 'from-green-400/10 to-green-400/5 border-green-400/20 text-green-400',
    red: 'from-red-400/10 to-red-400/5 border-red-400/20 text-red-400',
    yellow: 'from-yellow-400/10 to-yellow-400/5 border-yellow-400/20 text-yellow-400',
    gray: 'from-gray-400/10 to-gray-400/5 border-gray-400/20 text-gray-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <div className="text-white text-xl font-bold">{value}</div>
    </div>
  );
}
