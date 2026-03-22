import { useTickers, formatPrice, formatVolume, getSymbolName, getSymbolIcon } from '../hooks/useBinanceData';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onSelectSymbol: (symbol: string) => void;
}

export default function Dashboard({ onSelectSymbol }: DashboardProps) {
  const { tickers, loading, error, refetch } = useTickers();

  const totalMarketCap = tickers.reduce((s, t) => s + parseFloat(t.quoteVolume), 0);
  const avgChange = tickers.length > 0
    ? tickers.reduce((s, t) => s + parseFloat(t.priceChangePercent), 0) / tickers.length
    : 0;
  const gainers = tickers.filter(t => parseFloat(t.priceChangePercent) > 0).length;
  const losers = tickers.length - gainers;

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={20} />}
          label="24h Volume (USDT)"
          value={`$${formatVolume(totalMarketCap)}`}
          color="yellow"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Avg. 24h Change"
          value={`${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
          color={avgChange >= 0 ? 'green' : 'red'}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Gainers"
          value={`${gainers}`}
          sub={`of ${tickers.length} tracked`}
          color="green"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Losers"
          value={`${losers}`}
          sub={`of ${tickers.length} tracked`}
          color="red"
        />
      </div>

      {/* Crypto Table */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-yellow-400" />
            <h2 className="text-white font-semibold text-lg">Crypto Markets</h2>
            <span className="text-gray-500 text-sm">({tickers.length} pairs)</span>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20">
            <p className="text-red-400 text-sm">⚠ {error}. Retrying...</p>
          </div>
        )}

        {loading && tickers.length === 0 ? (
          <div className="p-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-yellow-400 animate-spin" />
              <p className="text-gray-400">Loading market data...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Pair</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">24h Change</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">24h High</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">24h Low</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Volume</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickers
                  .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                  .map((ticker, i) => {
                    const changePercent = parseFloat(ticker.priceChangePercent);
                    const isPositive = changePercent >= 0;

                    return (
                      <tr
                        key={ticker.symbol}
                        className="border-t border-gray-800/50 hover:bg-white/[0.02] transition cursor-pointer"
                        onClick={() => onSelectSymbol(ticker.symbol)}
                      >
                        <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center text-yellow-400 text-sm font-bold">
                              {getSymbolIcon(ticker.symbol)}
                            </div>
                            <div>
                              <div className="text-white font-medium text-sm">
                                {getSymbolName(ticker.symbol)}
                              </div>
                              <div className="text-gray-500 text-xs">{ticker.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-white font-mono text-sm">
                          ${formatPrice(ticker.price)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium ${
                            isPositive
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm hidden sm:table-cell">
                          ${formatPrice(ticker.highPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm hidden sm:table-cell">
                          ${formatPrice(ticker.lowPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-sm hidden md:table-cell">
                          ${formatVolume(ticker.quoteVolume)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSymbol(ticker.symbol);
                            }}
                            className="text-xs bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 px-3 py-1 rounded-lg transition font-medium"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    yellow: 'from-yellow-400/10 to-yellow-400/5 border-yellow-400/20 text-yellow-400',
    green: 'from-green-400/10 to-green-400/5 border-green-400/20 text-green-400',
    red: 'from-red-400/10 to-red-400/5 border-red-400/20 text-red-400',
    blue: 'from-blue-400/10 to-blue-400/5 border-blue-400/20 text-blue-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-xs font-medium">{label}</span>
      </div>
      <div className="text-white text-2xl font-bold">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}
