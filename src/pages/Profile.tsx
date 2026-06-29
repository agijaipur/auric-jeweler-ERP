import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Save, 
  Key,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, bookmarks, toggleBookmark } = useStore();
  const { success, error } = useToast();

  const isBookmarked = bookmarks.includes('/profile');

  // Change Password Mock fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      error('Fields Incomplete', 'Please fill in all secret code fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Code Mismatch', 'New password credentials do not match.');
      return;
    }
    if (oldPassword !== 'password123') {
      error('Verification Denied', 'Old password verify check failed.');
      return;
    }

    success('Secret Code Restored', 'Secret entry code updated successfully.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Security Account Profile</span>
            <User className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Review active security credentials and change secret entry codes</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/profile')}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-gold-400/10 border-gold-400/35 text-gold-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Left Card */}
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-3xl border border-neutral-200 dark:border-neutral-800 object-cover shadow-lg"
          />
          <div>
            <h3 className="text-lg font-bold font-poppins text-neutral-900 dark:text-white leading-snug">{user.name}</h3>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider mt-1 block font-poppins">{user.role}</span>
          </div>

          <div className="w-full border-t border-neutral-100 dark:border-neutral-800/80 pt-4 text-xs text-neutral-400 text-left space-y-3 font-sans">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>Role Permissions: Verified Level</span>
            </div>
          </div>
        </div>

        {/* Change password right */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handlePasswordSubmit} className="glass-panel p-6 space-y-5 text-xs text-neutral-700 dark:text-neutral-300">
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-gold-400" />
              <span>Change Security Key Code</span>
            </h4>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Current Key Code</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">New Key Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Re-verify New Key Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold flex items-center gap-1.5 shadow-md shadow-gold-500/10"
              >
                <Save className="w-4 h-4" />
                <span>Update Credentials</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
