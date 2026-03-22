import { useState, useEffect, useCallback, useRef } from 'react';
import { CryptoTicker, KlineData } from '../types';

const BINANCE_API = 'https://api.binance.com/api/v3';

const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT'
];

export function useTickers() {
  const [tickers, setTickers] = useState<CryptoTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickers = useCallback(async () => {
    try {
      const response = await fetch(`${BINANCE_API}/ticker/24hr`);
      if (!response.ok) throw new Error('Failed to fetch tickers');
      const data = await response.json();
      
      const filtered = data
        .filter((t: any) => TRACKED_SYMBOLS.includes(t.symbol))
        .map((t: any) => ({
          symbol: t.symbol,
          price: t.lastPrice,
          priceChange: t.priceChange,
          priceChangePercent: t.priceChangePercent,
          highPrice: t.highPrice,
          lowPrice: t.lowPrice,
          volume: t.volume,
          quoteVolume: t.quoteVolume,
        }));
      
      setTickers(filtered);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 10000);
    return () => clearInterval(interval);
  }, [fetchTickers]);

  return { tickers, loading, error, refetch: fetchTickers };
}

export function useKlines(symbol: string, interval: string = '1h', limit: number = 100) {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKlines = useCallback(async () => {
    try {
      const response = await fetch(
        `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch klines');
      const data = await response.json();
      
      const parsed: KlineData[] = data.map((k: any[]) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      
      setKlines(parsed);
    } catch (err) {
      console.error('Error fetching klines:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit]);

  useEffect(() => {
    setLoading(true);
    fetchKlines();
    const int = setInterval(fetchKlines, 30000);
    return () => clearInterval(int);
  }, [fetchKlines]);

  return { klines, loading, refetch: fetchKlines };
}

export function useWebSocketTicker(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.p));
    };
    
    ws.onerror = () => {
      console.error('WebSocket error');
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, [symbol]);

  return price;
}

export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(4);
  return num.toFixed(6);
}

export function formatVolume(volume: string | number): string {
  const num = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

export function getSymbolName(symbol: string): string {
  return symbol.replace('USDT', '');
}

export function getSymbolIcon(symbol: string): string {
  const icons: Record<string, string> = {
    BTCUSDT: '₿',
    ETHUSDT: 'Ξ',
    BNBUSDT: '◆',
    SOLUSDT: '◎',
    XRPUSDT: '✕',
    ADAUSDT: '₳',
    DOGEUSDT: 'Ð',
    AVAXUSDT: '▲',
    DOTUSDT: '●',
    MATICUSDT: '⬡',
    LINKUSDT: '⬡',
    LTCUSDT: 'Ł',
  };
  return icons[symbol] || '●';
}

export { TRACKED_SYMBOLS };
