import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Star, 
  Edit3, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Supplier } from '../utils/seedData';
import { exportToExcel } from '../utils/exportUtils';

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchaseOrders } = useStore();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gst: '',
    category: 'Gold' as Supplier['category'],
    rating: 5,
    leadTimeDays: 5,
    paymentTerms: 'Net 30',
    notes: '',
    isActive: true
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = suppliers.length;
    const activeCount = suppliers.filter(s => s.isActive).length;
    const averageRating = totalCount > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / totalCount).toFixed(1) : '5.0';
    return { totalCount, activeCount, averageRating };
  }, [suppliers]);

  // Filters
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter ? s.category === categoryFilter : true;
      return matchSearch && matchCategory;
    });
  }, [suppliers, searchTerm, categoryFilter]);

  // Handle Form Open
  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gst: '',
      category: 'Gold',
      rating: 5,
      leadTimeDays: 5,
      paymentTerms: 'Net 30',
      notes: '',
      isActive: true
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (supp: Supplier) => {
    setSelectedSupplier(supp);
    setFormData({
      name: supp.name,
      contactPerson: supp.contactPerson,
      email: supp.email,
      phone: supp.phone,
      address: supp.address,
      gst: supp.gst,
      category: supp.category,
      rating: supp.rating,
      leadTimeDays: supp.leadTimeDays,
      paymentTerms: supp.paymentTerms,
      notes: supp.notes,
      isActive: supp.isActive
    });
    setFormOpen(true);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSupplier) {
        // Update
        await updateSupplier({
          ...selectedSupplier,
          ...formData
        });
        success('Supplier Updated', `${formData.name} details have been updated successfully.`);
      } else {
        // Create
        await addSupplier({
          ...formData,
          isActive: true
        });
        success('Supplier Registered', `${formData.name} registered successfully.`);
      }
      setFormOpen(false);
    } catch (err) {
      error('Operation Failed', 'Something went wrong. Please check your fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      await deleteSupplier(id);
      success('Supplier Removed', 'The supplier record was deleted.');
      if (viewSupplier?.id === id) setViewSupplier(null);
    }
  };

  // Calculated stats for details panel
  const activeSupplierDetails = useMemo(() => {
    if (!viewSupplier) return null;
    const linkedPOs = purchaseOrders.filter(po => po.supplierId === viewSupplier.id);
    const totalSpend = linkedPOs.reduce((sum, po) => sum + po.totalCost, 0);
    return { linkedPOs, totalSpend };
  }, [viewSupplier, purchaseOrders]);

  const triggerExport = () => {
    const data = suppliers.map(s => ({
      Name: s.name,
      Contact: s.contactPerson,
      Email: s.email,
      Phone: s.phone,
      Category: s.category,
      Rating: s.rating,
      'Lead Time (days)': s.leadTimeDays,
      Terms: s.paymentTerms
    }));
    exportToExcel(data, 'Suppliers', 'suppliers_export');
  };

  return (
    <div className="space-y-6">
      {/* Intro Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Supplier Management</span>
            <Users className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Maintain jeweler bullion refiners, gemstone vendors, and packaging suppliers</p>
        </div>

        <div className="flex gap-2 text-xs font-semibold">
          <button 
            onClick={triggerExport}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            Export Directory
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Registered Vendors</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins">{stats.totalCount} Suppliers</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <Star className="w-5 h-5 fill-gold-400/10" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Average Rating Score</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins">{stats.averageRating} / 5.0</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Active Accounts</span>
            <span className="text-lg font-bold text-emerald-500 font-poppins">{stats.activeCount} Active</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search suppliers name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs outline-none text-neutral-700 dark:text-neutral-300"
        >
          <option value="">All Categories</option>
          <option value="Gold">Gold Refiners</option>
          <option value="Silver">Silver Refiners</option>
          <option value="Gemstones">Gemstone Vendors</option>
          <option value="Packaging">Packaging Supplies</option>
          <option value="General">General Supplies</option>
        </select>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List Table */}
        <div className="glass-panel lg:col-span-2 overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">Name / Contact</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Lead Time</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {filteredSuppliers.map((supp) => (
                  <tr 
                    key={supp.id} 
                    onClick={() => setViewSupplier(supp)}
                    className={`hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 cursor-pointer transition-colors ${viewSupplier?.id === supp.id ? 'bg-gold-400/5 dark:bg-gold-400/5' : ''}`}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{supp.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{supp.contactPerson}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded font-medium">
                        {supp.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-neutral-700 dark:text-neutral-300">{supp.leadTimeDays} days</td>
                    <td className="p-4">
                      <div className="flex items-center gap-0.5 text-gold-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < supp.rating ? 'fill-gold-400' : 'text-neutral-300 dark:text-neutral-800'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(supp)}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/30 text-neutral-500 hover:text-white transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(supp.id)}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-rose-500/30 text-neutral-500 hover:text-rose-400 transition-all hover:bg-rose-500/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Detail Panel */}
        <div className="glass-panel p-5 space-y-5 text-xs h-fit">
          {viewSupplier && activeSupplierDetails ? (
            <>
              <div>
                <h3 className="font-poppins font-bold text-sm text-neutral-900 dark:text-white">{viewSupplier.name}</h3>
                <span className="text-[10px] text-gold-500 font-semibold uppercase">{viewSupplier.category} requirements</span>
              </div>

              <div className="space-y-2 border-t border-b border-neutral-100 dark:border-neutral-800 py-3.5 text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{viewSupplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{viewSupplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400 text-top" />
                  <span>{viewSupplier.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono">GSTIN: {viewSupplier.gst}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider mb-2">Financial Records</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                    <span className="text-[9px] uppercase font-semibold text-neutral-400 block">Total Incurred Cost</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white mt-1 block">${activeSupplierDetails.totalSpend.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                    <span className="text-[9px] uppercase font-semibold text-neutral-400 block">POs Dispatched</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white mt-1 block">{activeSupplierDetails.linkedPOs.length} orders</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">Standard Payment Terms</span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{viewSupplier.paymentTerms}</span>
              </div>

              {viewSupplier.notes && (
                <div>
                  <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">Remarks</span>
                  <p className="text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">{viewSupplier.notes}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <Users className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <span>Select a supplier row to inspect details and financial summary records.</span>
            </div>
          )}
        </div>
      </div>

      {/* --------------------- MODAL: Add/Edit Supplier --------------------- */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedSupplier ? `Modify Supplier - ${selectedSupplier.name}` : 'Register Supplier Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Company Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Contact Person Name</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Phone Connection</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Supplier Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              >
                <option value="Gold">Gold Bullion</option>
                <option value="Silver">Silver bullion</option>
                <option value="Gemstones">Gemstones</option>
                <option value="Packaging">Packaging</option>
                <option value="General">General Supplies</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Lead Time Days</label>
              <input
                type="number"
                min="1"
                required
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 3 })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Payment Terms</label>
              <input
                type="text"
                required
                placeholder="e.g. Net 30"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">GST Registration Number</label>
              <input
                type="text"
                required
                placeholder="GSTIN Code"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Quality Rating Score</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              >
                <option value="5">5 Star Performance</option>
                <option value="4">4 Star Performance</option>
                <option value="3">3 Star Performance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Postal Address Details</label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Remarks & Performance Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
            >
              Register Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
