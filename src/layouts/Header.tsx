import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  User, 
  ShieldAlert, 
  CheckCircle,
  Gem,
  Package,
  Receipt,
  Users,
  Settings
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    theme, 
    setTheme, 
    setCommandPaletteOpen, 
    products, 
    orders, 
    jobs,
    addProduct,
    addCustomer,
    addOrder,
    notifications: liveNotifications,
    markNotificationRead
  } = useStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Filter notifications relevant to role
  const notifications = useMemo(() => {
    return liveNotifications.filter(n => !n.isRead && (!n.targetRoles || n.targetRoles.includes(user.role)));
  }, [liveNotifications, user]);

  const totalNotifications = notifications.length;

  // Header Title Resolver
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Hub';
    if (path === '/analytics') return 'Advanced Analytics';
    if (path === '/suppliers') return 'Suppliers Directory';
    if (path === '/purchase-orders') return 'Purchase Invoices';
    if (path === '/notifications') return 'Notification Alerts';
    if (path === '/activity-logs') return 'Activity Logs Audit';
    if (path === '/automations') return 'Workflows Control';
    const segment = path.split('/')[1];
    if (!segment) return 'Auric Jewels';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const handleQuickAdd = (type: string) => {
    setQuickAddOpen(false);
    if (type === 'product') {
      navigate('/products?add=true');
    } else if (type === 'customer') {
      navigate('/customers?add=true');
    } else if (type === 'order') {
      navigate('/orders?add=true');
    }
  };

  if (!user) return null;

  return (
    <header className="h-20 bg-white/70 dark:bg-luxury-black/70 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
      {/* Title */}
      <div>
        <h1 className="text-xl font-poppins font-bold tracking-tight text-neutral-900 dark:text-white m-0">
          {getHeaderTitle()}
        </h1>
        <p className="text-[11px] text-neutral-400 font-medium">
          Welcome back, <span className="text-gold-500 font-semibold">{user.name}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-4 py-2 w-48 lg:w-64 rounded-xl bg-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-800/40 text-left text-neutral-400 hover:text-neutral-500 transition-all text-xs font-sans"
        >
          <Search className="w-4 h-4 shrink-0 text-neutral-400" />
          <span className="flex-1 truncate">Quick Search...</span>
          <span className="text-[10px] text-neutral-400 bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 border border-neutral-200 dark:border-neutral-700">
            Ctrl+K
          </span>
        </button>

        {/* Quick Add Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-gold-500/10 hover:shadow-gold-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
          </button>

          <AnimatePresence>
            {quickAddOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setQuickAddOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border glass-panel bg-white dark:bg-neutral-900 shadow-2xl p-2 z-50 text-neutral-700 dark:text-neutral-300"
                >
                  <button
                    onClick={() => handleQuickAdd('product')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-xs font-medium transition-colors"
                  >
                    <Package className="w-4 h-4 text-gold-400" />
                    <span>New Item Catalog</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdd('customer')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-xs font-medium transition-colors"
                  >
                    <Users className="w-4 h-4 text-gold-400" />
                    <span>Register Customer</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdd('order')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-xs font-medium transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-gold-400" />
                    <span>Book Customer Order</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl border glass-panel bg-white dark:bg-neutral-900 shadow-2xl p-4 z-50 text-neutral-700 dark:text-neutral-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-poppins text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      Active Vault Notifications
                    </h4>
                    <button 
                      onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                      className="text-[10px] font-bold text-gold-400 hover:text-gold-300 uppercase"
                    >
                      View All
                    </button>
                  </div>

                  {totalNotifications === 0 ? (
                    <div className="text-center py-6 text-neutral-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle className="w-8 h-8 text-emerald-500/80" />
                      <span>All stocks reconciled.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {notifications.slice(0, 5).map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setNotifOpen(false);
                            markNotificationRead(n.id);
                            if (n.actionUrl) navigate(n.actionUrl);
                          }}
                          className="flex gap-3 text-xs leading-relaxed hover:bg-neutral-50 dark:hover:bg-neutral-800/30 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <h5 className="font-semibold text-neutral-900 dark:text-white">{n.title}</h5>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Mini Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 outline-none"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer"
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border glass-panel bg-white dark:bg-neutral-900 shadow-2xl p-2 z-50 text-neutral-700 dark:text-neutral-300"
                >
                  <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                    <p className="font-poppins text-xs font-semibold text-neutral-950 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{user.email}</p>
                    <p className="text-[10px] text-gold-500 font-bold uppercase tracking-wider mt-1">{user.role}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-xs font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>My Account Profile</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-xs font-medium transition-colors animate-delay-100"
                  >
                    <Settings className="w-4 h-4 text-neutral-400" />
                    <span>ERP Configurations</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
