import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Receipt, 
  Clock,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, deleteNotification, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();

  const handleAction = async (id: string, url?: string) => {
    await markNotificationRead(id);
    if (url) navigate(url);
  };

  const getNotifIcon = (type: string, severity: string) => {
    if (type === 'low_stock') return <AlertTriangle className="w-5 h-5 text-gold-400" />;
    if (type === 'production_delay') return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (type === 'po_received') return <Clock className="w-5 h-5 text-amber-400" />;
    if (type === 'po_verified') return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    return <Bell className="w-5 h-5 text-neutral-400" />;
  };

  const totalUnread = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Internal Notification Center</span>
            <Bell className="w-5 h-5 text-gold-400" />
          </h2>
          <p className="text-xs text-neutral-400">Track real-time system alerts, stock triggers, and pending verification notifications</p>
        </div>

        {totalUnread > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-panel p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-xs flex flex-col items-center gap-2">
            <CheckCircle className="w-10 h-10 text-emerald-500/80" />
            <span>All systems clear. No notifications.</span>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/85">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`flex gap-4 p-4 items-start transition-all rounded-lg ${
                  n.isRead ? 'opacity-65' : 'bg-gold-400/5 border-l-2 border-gold-400 shadow-sm'
                }`}
              >
                <div className="shrink-0 mt-0.5">{getNotifIcon(n.type, n.severity)}</div>
                
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />}
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-neutral-400 block font-mono mt-2">{new Date(n.createdAt).toLocaleString()}</span>
                  
                  {n.actionUrl && !n.isRead && (
                    <button
                      onClick={() => handleAction(n.id, n.actionUrl)}
                      className="mt-3 text-[10px] font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 uppercase tracking-wider"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
