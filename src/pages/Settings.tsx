import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { dbInstance } from '../db/db';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Gem, 
  Trash2, 
  DollarSign, 
  Percent,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetApplication, bookmarks, toggleBookmark } = useStore();
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/settings');

  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('$');
  const [taxRate, setTaxRate] = useState(3);
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [orderPrefix, setOrderPrefix] = useState('ORD');
  const [goldRate24K, setGoldRate24K] = useState(75.50);
  const [goldRate22K, setGoldRate22K] = useState(69.20);
  const [goldRate18K, setGoldRate18K] = useState(57.10);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName);
      setCurrency(settings.currency);
      setTaxRate(settings.taxRate);
      setInvoicePrefix(settings.invoicePrefix);
      setOrderPrefix(settings.orderPrefix);
      setGoldRate24K(settings.goldRate24K);
      setGoldRate22K(settings.goldRate22K);
      setGoldRate18K(settings.goldRate18K);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        companyName,
        companyLogo: settings?.companyLogo || '',
        currency,
        taxRate,
        invoicePrefix,
        orderPrefix,
        theme: settings?.theme || 'dark',
        goldRate24K,
        goldRate22K,
        goldRate18K
      });
      success('ERP Config Saved', 'System variables synchronized successfully.');
    } catch (err) {
      error('Configuration Error', 'Could not save parameters to IndexedDB settings store.');
    }
  };

  // Export Data JSON
  const handleBackupExport = async () => {
    try {
      const dataStr = await dbInstance.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auric_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      success('Backup Created', 'JSON archive downloaded successfully.');
    } catch (err) {
      error('Backup Failed', 'An error occurred packing vault details.');
    }
  };

  // Import Backup JSON
  const handleRestoreImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await dbInstance.importAllData(text);
        
        // Reload page to re-init Zustand store
        success('Database Restored', 'Re-synchronizing local variables. Refreshing dashboard...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        error('Restore Error', 'Invalid backup file structure.');
      }
    };
    fileReader.readAsText(file);
  };

  // Hard Reset App
  const handleHardReset = async () => {
    if (confirm('CAUTION: This will erase all customer CRM records, orders, inventory logs, and reset variables back to default seed state. Proceed?')) {
      try {
        await resetApplication();
        success('ERP Re-seeded', 'Restored default settings and populated 500+ sample data logs.');
      } catch (err) {
        error('Reset Failed', 'Clear browser cache and retry.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>ERP Configurations</span>
            <SettingsIcon className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Manage tax codes, metal rates, backup ledgers, and database syncs</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/settings')}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core settings form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5 text-xs text-neutral-700 dark:text-neutral-300">
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <SettingsIcon className="w-4 h-4 text-gold-400" />
              <span>Standard Settings Registry</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Billing Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-semibold"
                  >
                    <option value="$">USD ($)</option>
                    <option value="₹">INR (₹)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Jewelry GST / Tax %</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-3 pr-8 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Order Code Prefix</label>
                <input
                  type="text"
                  required
                  value={orderPrefix}
                  onChange={(e) => setOrderPrefix(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Invoice Code Prefix</label>
                <input
                  type="text"
                  required
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Gold and metal rates pricing factor */}
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-gold-400" />
              <span>Metal Valuation Factors ($/gram)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400 font-sans">24K Pure Gold</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goldRate24K}
                    onChange={(e) => setGoldRate24K(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-7 pr-2 outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400 font-sans">22K Fine Gold</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goldRate22K}
                    onChange={(e) => setGoldRate22K(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-7 pr-2 outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400 font-sans">18K Alloy Gold</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goldRate18K}
                    onChange={(e) => setGoldRate18K(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-7 pr-2 outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold flex items-center gap-1.5 shadow-md shadow-gold-500/10"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database administration & Backup */}
        <div className="space-y-6">
          {/* Backup Restore Card */}
          <div className="glass-panel p-6 space-y-4 text-xs">
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Backup & Recovery
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              Export database states (clients, orders, catalog) to a JSON file, or restore variables from a previous state file.
            </p>

            <button
              onClick={handleBackupExport}
              className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/35 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-1.5 font-bold"
            >
              <Download className="w-4 h-4 text-gold-400" />
              <span>Download JSON Backup</span>
            </button>

            <div className="relative w-full">
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/35 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-1.5 font-bold"
              >
                <Upload className="w-4 h-4 text-gold-400" />
                <span>Restore Backup File</span>
              </button>
            </div>
          </div>

          {/* Danger zone hard reset */}
          <div className="glass-panel p-6 space-y-4 border-rose-500/10 text-xs">
            <h4 className="text-sm font-poppins font-bold text-rose-500 uppercase tracking-wider">
              Danger coordinates zone
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              Erase all active data entries and restore the IndexedDB ledger to the fresh demo seeds.
            </p>

            <button
              onClick={handleHardReset}
              className="w-full py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-all flex items-center justify-center gap-1.5 font-bold"
            >
              <Trash2 className="w-4.5 h-4.5" />
              <span>Full ERP Database Re-seed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
