import { useTradeContext } from '../context/TradeContext';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export default function Notifications() {
  const { notifications, dismissNotification } = useTradeContext();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <XCircle size={16} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/30';
      case 'error': return 'border-red-500/30';
      case 'warning': return 'border-yellow-500/30';
      default: return 'border-blue-500/30';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`bg-[#1a1f2e] border ${getBorderColor(notif.type)} rounded-xl p-3 shadow-2xl flex items-start gap-3 animate-slide-in`}
        >
          <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium">{notif.title}</div>
            <div className="text-gray-400 text-xs mt-0.5 leading-relaxed">{notif.message}</div>
          </div>
          <button
            onClick={() => dismissNotification(notif.id)}
            className="text-gray-600 hover:text-gray-400 transition shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
