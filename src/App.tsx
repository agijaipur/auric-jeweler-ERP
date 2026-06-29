import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { ToastProvider } from './components/ui/Toast';
import { Loader } from './components/ui/Loader';
import { Sidebar } from './layouts/Sidebar';
import { Header } from './layouts/Header';
import { CommandPalette } from './components/CommandPalette';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Customers } from './pages/Customers';
import { Orders } from './pages/Orders';
import { Production } from './pages/Production';
import { Reports } from './pages/Reports';
import { AiAssistant } from './pages/AiAssistant';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { motion, AnimatePresence } from 'framer-motion';

// Protected Route Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, sidebarOpen } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-luxury-black transition-colors duration-200">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Panel View Grid */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ paddingLeft: sidebarOpen ? '260px' : '76px' }}
      >
        <Header />
        
        {/* Page Inner Container */}
        <main className="flex-grow p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="pageTransitionEnter"
              animate="pageTransitionEnterActive"
              exit={{ opacity: 0, y: -4 }}
              variants={{
                pageTransitionEnter: { opacity: 0, y: 4 },
                pageTransitionEnterActive: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { initStore, isLoading } = useStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/production" element={<Production />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-assistant" element={<AiAssistant />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProtectedLayout>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ToastProvider>
  );
}
