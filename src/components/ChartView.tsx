import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ReferenceLine,
} from 'recharts';
import { useKlines, formatPrice, getSymbolName, TRACKED_SYMBOLS } from '../hooks/useBinanceData';
import { RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface ChartViewProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const INTERVALS = [
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

export default function ChartView({ selectedSymbol, onSymbolChange }: ChartViewProps) {
  const [interval, setInterval] = useState('1h');
  const { klines, loading, refetch } = useKlines(selectedSymbol, interval, 100);

  const chartData = useMemo(() => {
    return klines.map((k) => ({
      time: new Date(k.time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
      volume: k.volume,
      change: k.close - k.open,
      color: k.close >= k.open ? '#22c55e' : '#ef4444',
    }));
  }, [klines]);

  const ema20 = useMemo(() => {
    if (klines.length < 20) return [];
    const closes = klines.map(k => k.close);
    const multiplier = 2 / 21;
    const ema: number[] = [closes[0]];
    for (let i = 1; i < closes.length; i++) {
      ema.push((closes[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
    return ema;
  }, [klines]);

  const dataWithEMA = useMemo(() => {
    return chartData.map((d, i) => ({
      ...d,
      ema20: ema20[i] || null,
    }));
  }, [chartData, ema20]);

  const currentPrice = klines.length > 0 ? klines[klines.length - 1].close : 0;
  const firstPrice = klines.length > 0 ? klines[0].open : 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  const highestPrice = klines.length > 0 ? Math.max(...klines.map(k => k.high)) : 0;
  const lowestPrice = klines.length > 0 ? Math.min(...klines.map(k => k.low)) : 0;

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              className="bg-[#1a1f2e] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            >
              {TRACKED_SYMBOLS.map(s => (
                <option key={s} value={s}>{getSymbolName(s)}/USDT</option>
              ))}
            </select>
            <div>
              <div className="text-2xl font-bold text-white font-mono">${formatPrice(currentPrice)}</div>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#1a1f2e] rounded-lg p-0.5">
              {INTERVALS.map(int => (
                <button
                  key={int.value}
                  onClick={() => setInterval(int.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    interval === int.value
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
            <button
              onClick={refetch}
              className="text-gray-400 hover:text-yellow-400 transition"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Price Stats */}
        <div className="flex gap-6 mt-3 text-xs">
          <div>
            <span className="text-gray-500">High: </span>
            <span className="text-green-400 font-mono">${formatPrice(highestPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Low: </span>
            <span className="text-red-400 font-mono">${formatPrice(lowestPrice)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-gray-500" />
            <span className="text-gray-500">Interval: {interval}</span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-yellow-400" />
          Price Chart — {getSymbolName(selectedSymbol)}/USDT
        </h3>
        {loading && klines.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <RefreshCw size={32} className="text-yellow-400 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dataWithEMA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1f2937' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${formatPrice(val)}`}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any, name: any) => {
                  if (name === 'volume') return [formatPrice(value), 'Volume'];
                  return [`$${formatPrice(value)}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)];
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#priceGradient)"
                name="close"
              />
              {ema20.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="ema20"
                  stroke="#eab308"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 4"
                  name="EMA 20"
                />
              )}
              <ReferenceLine y={currentPrice} stroke="#6b7280" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume Chart */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          Volume
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={dataWithEMA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#1f2937' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatPrice(val)}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="volume"
              fill="#3b82f6"
              fillOpacity={0.5}
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Activity({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
