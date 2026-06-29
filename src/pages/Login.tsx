import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Gem, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, rememberedEmail, isAuthenticated } = useStore();
  const { success, error } = useToast();

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Autofill helpers for client demo
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    success('Credentials Loaded', `Loaded demo account: ${demoEmail}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Input Required', 'Please enter email and password');
      return;
    }

    setLoading(true);
    // Simulate brief network delay
    setTimeout(async () => {
      const ok = await login(email, password, rememberMe);
      setLoading(false);
      if (ok) {
        success('Access Granted', 'Welcome to Auric Jewels ERP System.');
        navigate('/');
      } else {
        error('Access Denied', 'Invalid credentials. Try quick-fill accounts below.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 relative overflow-hidden">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gold-400/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gold-400/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-gold-400/20 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center shadow-lg shadow-gold-400/20 mb-3">
            <Gem className="w-8 h-8 text-neutral-950" />
          </div>
          <h2 className="text-2xl font-poppins font-extrabold text-white tracking-wide">
            AURIC JEWELS ERP
          </h2>
          <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mt-1 font-poppins">
            Luxury Administrative Console
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-poppins">
              Security Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                placeholder="email@auric.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-400 rounded-xl py-3 pl-11 pr-4 text-sm text-neutral-200 outline-none transition-all placeholder-neutral-600 font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-poppins">
                Secret Password Code
              </label>
              <button
                type="button"
                onClick={() => success('Password Help', 'Secret code is: password123')}
                className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                Forgot Code?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-400 rounded-xl py-3 pl-11 pr-11 text-sm text-neutral-200 outline-none transition-all placeholder-neutral-600 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-gold-400 bg-neutral-950 border-neutral-800 rounded focus:ring-0"
            />
            <label
              htmlFor="remember-me"
              className="text-xs text-neutral-400 ml-2 font-medium cursor-pointer select-none"
            >
              Keep session logged in (Remember Me)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Verify & Authorize</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts - Quick Fill */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-400 mb-3 text-center font-poppins">
            Demo Portal Access (Select to Autofill)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickFill('admin@auric.com')}
              className="px-2 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 hover:border-gold-400/20 text-neutral-300 font-semibold text-center transition-all truncate"
            >
              👑 Administrator
            </button>
            <button
              onClick={() => handleQuickFill('inventory@auric.com')}
              className="px-2 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 hover:border-gold-400/20 text-neutral-300 font-semibold text-center transition-all truncate"
            >
              📦 Inventory Manager
            </button>
            <button
              onClick={() => handleQuickFill('sales@auric.com')}
              className="px-2 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 hover:border-gold-400/20 text-neutral-300 font-semibold text-center transition-all truncate"
            >
              💼 Sales Executive
            </button>
            <button
              onClick={() => handleQuickFill('production@auric.com')}
              className="px-2 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 hover:border-gold-400/20 text-neutral-300 font-semibold text-center transition-all truncate"
            >
              🔨 Production Manager
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
