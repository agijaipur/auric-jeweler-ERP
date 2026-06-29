import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  Boxes, 
  Search, 
  ArrowRightLeft, 
  History, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Barcode,
  ArrowUpRight,
  ArrowDownLeft,
  Settings2,
  CheckCircle,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Inventory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, transactions, addTransaction, updateProduct, user, bookmarks, toggleBookmark } = useStore();
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/inventory');

  const querySearch = searchParams.get('search') || '';

  // UI Local Tabs
  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [locationFilter, setLocationFilter] = useState('');

  // Modals
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form states
  const [adjustData, setAdjustData] = useState({
    quantity: 1,
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    reason: 'Vault Restock'
  });

  const [transferData, setTransferData] = useState({
    quantity: 1,
    destination: 'Vault-B-2',
    reason: 'Display Showroom Transfer'
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGrams = products.reduce((sum, p) => sum + (p.stock * p.weight), 0);
    const lowStockItems = products.filter(p => p.stock < 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

    return {
      totalGrams: Math.round(totalGrams),
      lowStockItems,
      totalValue
    };
  }, [products]);

  // Unique list of vault locations
  const locations = useMemo(() => {
    return Array.from(new Set(products.map(p => p.location.split('-')[0] + '-' + p.location.split('-')[1])));
  }, [products]);

  // Filters levels
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLocation = locationFilter ? p.location.includes(locationFilter) : true;
      return matchSearch && matchLocation;
    });
  }, [products, searchTerm, locationFilter]);

  // Open adjustment drawer
  const openAdjust = (prod: any) => {
    setSelectedProduct(prod);
    setAdjustData({ quantity: 1, type: 'IN', reason: 'Vault Restock' });
    setAdjustOpen(true);
  };

  // Open transfer drawer
  const openTransfer = (prod: any) => {
    setSelectedProduct(prod);
    setTransferData({ quantity: 1, destination: 'Vault-B-2', reason: 'Display Showroom Transfer' });
    setTransferOpen(true);
  };

  // Handle Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = adjustData.quantity;
    if (qty <= 0) {
      error('Adjustment Error', 'Quantity must be greater than zero');
      return;
    }

    const type = adjustData.type;
    let nextStock = selectedProduct.stock;
    
    if (type === 'IN') {
      nextStock += qty;
    } else {
      if (selectedProduct.stock < qty) {
        error('Shortage Error', 'Not enough physical stock in vault for reduction');
        return;
      }
      nextStock -= qty;
    }

    // Update Product stock
    await updateProduct({
      ...selectedProduct,
      stock: nextStock
    });

    // Write Log transaction
    await addTransaction({
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      type: type === 'IN' ? 'IN' : 'ADJUSTMENT',
      quantity: qty,
      weight: selectedProduct.weight * qty,
      sourceLocation: type === 'IN' ? 'External Vendor' : selectedProduct.location,
      destinationLocation: selectedProduct.location,
      referenceId: 'MANUAL-ADJ',
      performedBy: user?.email || 'inventory@auric.com',
      notes: adjustData.reason
    });

    success('Vault Stock Adjusted', `Successfully updated stock of ${selectedProduct.name} to ${nextStock} units.`);
    setAdjustOpen(false);
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = transferData.quantity;
    if (qty <= 0) {
      error('Transfer Error', 'Transfer quantity must be greater than zero');
      return;
    }

    if (selectedProduct.stock < qty) {
      error('Shortage Error', 'Not enough stock in source vault');
      return;
    }

    // Reduce stock from original product or simply update its location if moving entire inventory
    // In local simulation, if moving subset, we create transactions; if moving all, we update location.
    // For ease: we move location of this asset or log the movement.
    const updatedProd = {
      ...selectedProduct,
      location: transferData.destination
    };
    await updateProduct(updatedProd);

    // Add log
    await addTransaction({
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      type: 'TRANSFER',
      quantity: qty,
      weight: selectedProduct.weight * qty,
      sourceLocation: selectedProduct.location,
      destinationLocation: transferData.destination,
      referenceId: 'LOC-TRANSFER',
      performedBy: user?.email || 'inventory@auric.com',
      notes: transferData.reason
    });

    success('Transfer Dispatched', `Relocated ${qty} units of ${selectedProduct.name} to ${transferData.destination}.`);
    setTransferOpen(false);
  };

  const isInv = user?.role === 'Inventory Manager' || user?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* KPI Intro Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Inventory & Vault Stock</span>
            <Boxes className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Manage fine assets, allocate vault coordinates, and audit logs</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/inventory')}
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

      {/* Statistics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Estimated Wealth value</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins">${stats.totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Gross Weight Net</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins font-mono">{stats.totalGrams} grams</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider block">Under-Stocked Alert</span>
            <span className="text-lg font-bold text-rose-500 font-poppins">{stats.lowStockItems} items flagged</span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab('levels')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === 'levels'
              ? 'border-gold-400 text-gold-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Active Vault Levels
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-gold-400 text-gold-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Transaction Audits ({transactions.length})
        </button>
      </div>

      {/* Tab: Levels */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          {/* Filters levels */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search stock catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto text-xs">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-auto bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
              >
                <option value="">All Vault Sections</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Levels Table */}
          <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                    <th className="p-4">SKU / Item Details</th>
                    <th className="p-4">Vault Coordinates</th>
                    <th className="p-4">Gram Weight</th>
                    <th className="p-4">Physical Stock</th>
                    <th className="p-4">Pricing Value</th>
                    {isInv && <th className="p-4 text-right">Vault Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredProducts.slice(0, 100).map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg shrink-0 border border-neutral-200 dark:border-neutral-800" />
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 dark:text-white block truncate">{prod.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono uppercase">{prod.sku}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50">
                          <MapPin className="w-3.5 h-3.5 text-gold-400" />
                          <span>{prod.location}</span>
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-neutral-700 dark:text-neutral-300">{prod.weight}g</td>
                      <td className="p-4 font-mono">
                        <span className={`font-bold ${prod.stock < 5 ? 'text-rose-500' : 'text-neutral-900 dark:text-white'}`}>
                          {prod.stock} units
                        </span>
                        {prod.stock < 5 && <span className="text-[9px] text-rose-400 block font-semibold uppercase mt-0.5">Under Stocked</span>}
                      </td>
                      <td className="p-4 font-mono font-semibold text-gold-500">${(prod.sellingPrice * prod.stock).toLocaleString()}</td>
                      {isInv && (
                        <td className="p-4 text-right space-x-1 shrink-0">
                          <button
                            onClick={() => openAdjust(prod)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/30 text-[10px] font-semibold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => openTransfer(prod)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/30 text-[10px] font-semibold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            Transfer
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length > 100 && (
              <div className="p-3 text-center text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
                Displaying first 100 entries. Refine search parameters for specific lookup.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: History Logs */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                    <th className="p-4">Tx Date</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Product details</th>
                    <th className="p-4">Vault Direction</th>
                    <th className="p-4">Quantity / Weight</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                  {transactions.slice(0, 100).map((tx) => {
                    const typeClasses = {
                      IN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      OUT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      TRANSFER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      ADJUSTMENT: 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                    };

                    const DirectionIcon = {
                      IN: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />,
                      OUT: <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />,
                      TRANSFER: <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />,
                      ADJUSTMENT: <Settings2 className="w-3.5 h-3.5 text-gold-400" />
                    };

                    return (
                      <tr key={tx.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                        <td className="p-4 font-mono font-semibold text-neutral-500">{tx.date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9.5px] font-bold tracking-wider uppercase ${typeClasses[tx.type]}`}>
                            {DirectionIcon[tx.type]}
                            <span>{tx.type}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-neutral-900 dark:text-white block truncate max-w-xs">{tx.productName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono uppercase">{tx.sku}</span>
                        </td>
                        <td className="p-4 text-neutral-500 leading-snug">
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span>{tx.sourceLocation}</span>
                            <span className="text-neutral-400">→</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{tx.destinationLocation}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="font-bold text-neutral-900 dark:text-white">{tx.quantity} units</span>
                          <span className="text-[10px] text-neutral-400 block font-semibold">{tx.weight}g</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">{tx.referenceId}</td>
                        <td className="p-4 font-mono text-[11px] text-neutral-500">{tx.performedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: Adjust Stock --------------------- */}
      <Modal
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title={selectedProduct ? `Vault Adjustment - ${selectedProduct.name}` : 'Stock Adjustment'}
      >
        {selectedProduct && (
          <form onSubmit={handleAdjustSubmit} className="space-y-5 text-xs">
            <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Current Physical Stock</span>
                <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">{selectedProduct.stock} units</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Location</span>
                <span className="font-mono text-sm font-bold text-gold-400">{selectedProduct.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Audit Type</label>
                <select
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value as any })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
                >
                  <option value="IN">Inward (Add Stock)</option>
                  <option value="OUT">Outward (Reduce Stock)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Change Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Reason / Reference Note</label>
              <textarea
                required
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                rows={3}
                placeholder="Details of audit or restocking order code..."
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAdjustOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
              >
                Confirm Adjust
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* --------------------- MODAL: Transfer Stock --------------------- */}
      <Modal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        title={selectedProduct ? `Vault Transfer - ${selectedProduct.name}` : 'Vault Transfer'}
      >
        {selectedProduct && (
          <form onSubmit={handleTransferSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Current Location</span>
                <span className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">{selectedProduct.location}</span>
              </div>
              <div className="p-3 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Max Available Units</span>
                <span className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">{selectedProduct.stock} units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Destination Coordinate</label>
                <input
                  type="text"
                  required
                  value={transferData.destination}
                  onChange={(e) => setTransferData({ ...transferData, destination: e.target.value })}
                  placeholder="e.g. Showroom-Rack 3"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Transfer Qty</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  required
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Transfer Notes / Reason</label>
              <textarea
                required
                value={transferData.reason}
                onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                rows={3}
                placeholder="Reason for displacement or display order code..."
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
              >
                Confirm Dispatch
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
