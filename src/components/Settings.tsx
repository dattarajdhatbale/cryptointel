import { useState } from 'react';
import { useTradeContext } from '../context/TradeContext';
import {
  Mail,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Send,
  Info,
  AlertTriangle,
} from 'lucide-react';

export default function Settings() {
  const { emailConfig, setEmailConfig, addNotification } = useTradeContext();
  const [localConfig, setLocalConfig] = useState(emailConfig);
  const [testSending, setTestSending] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEmailConfig(localConfig);
    setSaved(true);
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your notification preferences have been updated.',
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestEmail = async () => {
    if (!localConfig.email) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please enter an email address first.',
      });
      return;
    }

    setTestSending(true);

    try {
      const emailjs = await import('@emailjs/browser');
      await emailjs.send(
        'service_demo',
        'template_demo',
        {
          to_email: localConfig.email,
          subject: '🧪 CryptoIntel Test Notification',
          message: 'This is a test notification from CryptoIntel AI Trading Platform. Your email alerts are configured correctly!',
        },
        'demo_public_key'
      );
      addNotification({
        type: 'success',
        title: 'Test Email Sent',
        message: `Test notification sent to ${localConfig.email}`,
      });
    } catch {
      addNotification({
        type: 'info',
        title: 'Email Service',
        message: 'To enable email notifications, configure your EmailJS credentials (service ID, template ID, and public key). See the setup guide below.',
      });
    }

    setTestSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Email Notifications */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Mail size={20} className="text-yellow-400" />
          <h2 className="text-white font-semibold text-lg">Email Notifications</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Email Alerts</label>
              <p className="text-gray-500 text-xs mt-0.5">Receive trade signals and alerts via email</p>
            </div>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                localConfig.enabled ? 'bg-yellow-400' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  localConfig.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Email Input */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
            <input
              type="email"
              value={localConfig.email}
              onChange={e => setLocalConfig({ ...localConfig, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          {/* Alert Types */}
          <div className="space-y-3">
            <label className="text-gray-400 text-sm">Alert Types</label>
            
            <AlertToggle
              icon={<Bell size={16} />}
              label="Trade Signals"
              description="Get notified when strong AI signals are detected"
              checked={localConfig.alertTypes.tradeSignals}
              onChange={() => setLocalConfig({
                ...localConfig,
                alertTypes: { ...localConfig.alertTypes, tradeSignals: !localConfig.alertTypes.tradeSignals },
              })}
            />
            <AlertToggle
              icon={<AlertTriangle size={16} />}
              label="Price Alerts"
              description="Notifications for significant price movements"
              checked={localConfig.alertTypes.priceAlerts}
              onChange={() => setLocalConfig({
                ...localConfig,
                alertTypes: { ...localConfig.alertTypes, priceAlerts: !localConfig.alertTypes.priceAlerts },
              })}
            />
            <AlertToggle
              icon={<Shield size={16} />}
              label="Portfolio Updates"
              description="Daily summary of your portfolio performance"
              checked={localConfig.alertTypes.portfolioUpdates}
              onChange={() => setLocalConfig({
                ...localConfig,
                alertTypes: { ...localConfig.alertTypes, portfolioUpdates: !localConfig.alertTypes.portfolioUpdates },
              })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={handleTestEmail}
              disabled={testSending}
              className="flex items-center gap-2 bg-[#1a1f2e] text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#252b3b] transition border border-gray-700 disabled:opacity-50"
            >
              <Send size={16} className={testSending ? 'animate-pulse' : ''} />
              {testSending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      </div>

      {/* EmailJS Setup Guide */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Info size={20} className="text-blue-400" />
          <h2 className="text-white font-semibold">Email Setup Guide</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            This platform uses <span className="text-yellow-400 font-medium">EmailJS</span> for 
            client-side email notifications. To enable email alerts:
          </p>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-2">
              <span className="text-yellow-400 font-bold shrink-0">1.</span>
              Create a free account at <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">emailjs.com</a>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 font-bold shrink-0">2.</span>
              Create an email service (Gmail, Outlook, etc.)
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 font-bold shrink-0">3.</span>
              Create an email template with variables: <code className="text-green-400 bg-green-400/10 px-1 rounded">to_email</code>, <code className="text-green-400 bg-green-400/10 px-1 rounded">subject</code>, <code className="text-green-400 bg-green-400/10 px-1 rounded">message</code>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 font-bold shrink-0">4.</span>
              Replace the service ID, template ID, and public key in the source code
            </li>
          </ol>
          <div className="bg-[#0d1117] rounded-lg p-4 text-xs font-mono text-gray-400 border border-gray-800">
            <div className="text-gray-600 mb-1">// Update in TradeSignals.tsx and Settings.tsx:</div>
            <div>
              <span className="text-purple-400">emailjs</span>.send(
            </div>
            <div className="pl-4">
              <span className="text-green-400">'your_service_id'</span>,
            </div>
            <div className="pl-4">
              <span className="text-green-400">'your_template_id'</span>,
            </div>
            <div className="pl-4">
              {'{ ... }'},
            </div>
            <div className="pl-4">
              <span className="text-green-400">'your_public_key'</span>
            </div>
            <div>);</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-2">About CryptoIntel</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          CryptoIntel is an AI-powered cryptocurrency trading intelligence platform that provides 
          real-time market data from Binance, advanced technical analysis, and automated trade 
          signals. Built with React, TypeScript, and powered by custom AI algorithms analyzing 
          RSI, MACD, EMA, and Bollinger Bands indicators.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Binance API', 'EmailJS'].map(tech => (
            <span key={tech} className="text-xs bg-[#1a1f2e] text-gray-400 px-2 py-1 rounded-md border border-gray-800">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertToggle({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
        checked ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-[#0d1117] border-gray-800'
      }`}
      onClick={onChange}
    >
      <div className="flex items-center gap-3">
        <div className={`${checked ? 'text-yellow-400' : 'text-gray-600'}`}>{icon}</div>
        <div>
          <div className="text-white text-sm font-medium">{label}</div>
          <div className="text-gray-500 text-xs">{description}</div>
        </div>
      </div>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
        checked ? 'bg-yellow-400 border-yellow-400' : 'border-gray-600'
      }`}>
        {checked && <CheckCircle size={10} className="text-black" />}
      </div>
    </div>
  );
}
