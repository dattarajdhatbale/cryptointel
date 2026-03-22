import { useState } from 'react';
import { TradeProvider } from './context/TradeContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChartView from './components/ChartView';
import TradeDisplay from './components/TradeDisplay';
import TradeSignals from './components/TradeSignals';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import { TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('chart');
  };

  return (
    <TradeProvider>
      <div className="min-h-screen bg-[#080b14] text-white">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="max-w-[1440px] mx-auto px-4 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard onSelectSymbol={handleSelectSymbol} />
          )}
          {activeTab === 'chart' && (
            <ChartView
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
            />
          )}
          {activeTab === 'trades' && <TradeDisplay />}
          {activeTab === 'signals' && <TradeSignals />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-8">
          <div className="max-w-[1440px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-gray-600 text-xs">
              © 2025 CryptoIntel — AI-Powered Trading Intelligence
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Data: Binance API</span>
              <span>•</span>
              <span>Analysis: AI-Powered</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Real-time
              </span>
            </div>
          </div>
        </footer>

        <Notifications />
      </div>
    </TradeProvider>
  );
}
