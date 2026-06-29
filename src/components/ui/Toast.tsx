import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => toast(title, description, 'success'), [toast]);
  const warning = useCallback((title: string, description?: string) => toast(title, description, 'warning'), [toast]);
  const error = useCallback((title: string, description?: string) => toast(title, description, 'error'), [toast]);
  const info = useCallback((title: string, description?: string) => toast(title, description, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, warning, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-gold-400 shrink-0" />,
              error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
            };

            const borders = {
              success: 'border-emerald-500/20 dark:border-emerald-500/10',
              warning: 'border-gold-400/20 dark:border-gold-400/10',
              error: 'border-rose-500/20 dark:border-rose-500/10',
              info: 'border-blue-400/20 dark:border-blue-400/10',
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-lg ${borders[t.type]} bg-white/95 dark:bg-luxury-charcoal/95`}
              >
                {icons[t.type]}
                <div className="flex-1 min-w-0">
                  <h4 className="font-poppins text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
