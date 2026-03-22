import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Trade, EmailConfig } from '../types';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
  closeTrade: (id: string, closePrice: number) => void;
  removeTrade: (id: string) => void;
  emailConfig: EmailConfig;
  setEmailConfig: (config: EmailConfig) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_trades');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [emailConfig, setEmailConfigState] = useState<EmailConfig>(() => {
    try {
      const saved = localStorage.getItem('email_config');
      return saved ? JSON.parse(saved) : {
        email: '',
        enabled: false,
        alertTypes: { tradeSignals: true, priceAlerts: true, portfolioUpdates: false },
      };
    } catch {
      return {
        email: '',
        enabled: false,
        alertTypes: { tradeSignals: true, priceAlerts: true, portfolioUpdates: false },
      };
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const saveTrades = (t: Trade[]) => {
    localStorage.setItem('crypto_trades', JSON.stringify(t));
  };

  const addTrade = useCallback((trade: Omit<Trade, 'id' | 'timestamp'>) => {
    const newTrade: Trade = {
      ...trade,
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setTrades(prev => {
      const updated = [newTrade, ...prev];
      saveTrades(updated);
      return updated;
    });
    addNotification({
      type: 'success',
      title: 'Trade Executed',
      message: `${trade.type} ${trade.quantity} ${trade.symbol} at $${trade.price.toFixed(2)}`,
    });
  }, []);

  const closeTrade = useCallback((id: string, closePrice: number) => {
    setTrades(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const pnl = t.type === 'BUY'
            ? (closePrice - t.price) * t.quantity
            : (t.price - closePrice) * t.quantity;
          return { ...t, status: 'CLOSED' as const, pnl };
        }
        return t;
      });
      saveTrades(updated);
      return updated;
    });
  }, []);

  const removeTrade = useCallback((id: string) => {
    setTrades(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTrades(updated);
      return updated;
    });
  }, []);

  const setEmailConfig = useCallback((config: EmailConfig) => {
    setEmailConfigState(config);
    localStorage.setItem('email_config', JSON.stringify(config));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== notification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <TradeContext.Provider value={{
      trades, addTrade, closeTrade, removeTrade,
      emailConfig, setEmailConfig,
      notifications, addNotification, dismissNotification,
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTradeContext must be used within TradeProvider');
  return ctx;
}
