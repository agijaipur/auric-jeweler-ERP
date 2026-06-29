import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Users, 
  Receipt, 
  Hammer, 
  BarChart3, 
  Bot, 
  Settings, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Gem
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, sidebarOpen, toggleSidebar } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Define sidebar menu items and role-based permissions
  const menuItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Sales Executive', 'Production Manager']
    },
    { 
      path: '/products', 
      label: 'Products', 
      icon: <Package className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Production Manager'] 
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      icon: <Boxes className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Production Manager'] 
    },
    { 
      path: '/customers', 
      label: 'Customers', 
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Sales Executive'] 
    },
    { 
      path: '/orders', 
      label: 'Orders', 
      icon: <Receipt className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Sales Executive'] 
    },
    { 
      path: '/production', 
      label: 'Production', 
      icon: <Hammer className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Production Manager'] 
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Sales Executive', 'Production Manager'] 
    },
    { 
      path: '/ai-assistant', 
      label: 'AI Assistant', 
      icon: <Bot className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Sales Executive', 'Production Manager'] 
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['Administrator'] 
    },
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: <User className="w-5 h-5" />,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Sales Executive', 'Production Manager'] 
    }
  ];

  // Filter items based on active role
  const visibleItems = menuItems.filter(item => item.allowedRoles.includes(user.role));

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 76 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 bottom-0 z-40 bg-neutral-950 text-neutral-300 border-r border-neutral-800/60 flex flex-col justify-between overflow-hidden shadow-2xl shrink-0`}
    >
      {/* Top Brand Logo */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-800/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/10">
            <Gem className="w-5 h-5 text-neutral-950 font-bold" />
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-poppins font-bold text-sm tracking-widest text-white">AURIC</span>
              <span className="text-[10px] text-gold-400 font-semibold tracking-wider -mt-1 font-poppins">JEWELS ERP</span>
            </motion.div>
          )}
        </div>

        {sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-gold-400/20 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle Button for collapsed state */}
      {!sidebarOpen && (
        <div className="flex justify-center py-4 border-b border-neutral-800/30">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-gold-400/20 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-none">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-sans text-sm font-medium border
              ${isActive 
                ? 'bg-gold-400/10 text-gold-300 border-gold-400/25 shadow-[inset_0_1px_1px_rgba(212,175,55,0.05)]' 
                : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
              }
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="truncate"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Session Profile & LogOut */}
      <div className="p-4 border-t border-neutral-800/50 bg-neutral-900/30 space-y-3">
        {sidebarOpen && (
          <div className="flex items-center gap-3 p-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl border border-neutral-700/80 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-poppins text-xs font-semibold text-white truncate">{user.name}</h5>
              <p className="text-[10px] text-gold-400 font-semibold truncate uppercase mt-0.5">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-neutral-800 hover:border-rose-500/20 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-xs font-semibold`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
