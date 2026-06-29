import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Cake, 
  Heart, 
  FileText, 
  Coins, 
  CalendarDays, 
  Gift, 
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Customer } from '../utils/seedData';

export const Customers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, user, bookmarks, toggleBookmark } = useStore();
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/customers');

  const viewId = searchParams.get('view');
  const addTrigger = searchParams.get('add');

  // Local search
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Sync state from query parameters
  useEffect(() => {
    if (viewId) {
      const found = customers.find(c => c.id === viewId);
      if (found) {
        setViewCustomer(found);
      }
    } else {
      setViewCustomer(null);
    }
  }, [viewId, customers]);

  useEffect(() => {
    if (addTrigger === 'true') {
      setEditingCustomer(null);
      setFormOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [addTrigger, searchParams, setSearchParams]);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gst: '',
    birthday: '',
    anniversary: '',
    notes: '',
    favoriteProducts: [] as string[]
  });

  // Open add form
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gst: '',
      birthday: '',
      anniversary: '',
      notes: '',
      favoriteProducts: []
    });
    setFormOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      gst: c.gst,
      birthday: c.birthday,
      anniversary: c.anniversary,
      notes: c.notes,
      favoriteProducts: c.favoriteProducts
    });
    setFormOpen(true);
  };

  // Submit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      error('Input Error', 'Name, Email, and Phone are mandatory fields');
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer({
          ...editingCustomer,
          ...formData
        });
        success('Client Details Updated', `${formData.name}'s profile saved.`);
      } else {
        const mockPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        await addCustomer({
          ...formData,
          photo: mockPhoto
        });
        success('Client Registered', `${formData.name} added to CRM index.`);
      }
      setFormOpen(false);
    } catch (err) {
      error('Operation Failed', 'Could not record customer details');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely erase CRM records for client ${name}?`)) {
      await deleteCustomer(id);
      success('Client Profile Retired', 'Customer deleted from registry.');
      if (viewId === id) {
        searchParams.delete('view');
        setSearchParams(searchParams);
      }
    }
  };

  // Filter list
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const q = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  // Customer order history helper
  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };

  const isSalesOrAdmin = user?.role === 'Sales Executive' || user?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Customer CRM Index</span>
            <Users className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">
            Audit high-profile clientele relations, purchase history, and LTV trends
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => toggleBookmark('/customers')}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-gold-400/10 border-gold-400/35 text-gold-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          {isSalesOrAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs shadow-md shadow-gold-500/10 hover:shadow-gold-500/25 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input bar */}
      <div className="glass-panel p-4 flex gap-4 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Lookup clients by name, contact, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>
      </div>

      {/* Grid of customer profile cards */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-panel py-20 text-center text-neutral-400 text-sm flex flex-col items-center justify-center gap-2">
          <Users className="w-12 h-12 text-gold-400/50" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">No Clients Found</h4>
          <span>Confirm spelling or add new client.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => (
            <motion.div
              layout
              key={cust.id}
              onClick={() => setSearchParams({ view: cust.id })}
              className="glass-panel p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              {/* Gold border top for highly active VIP clients */}
              {cust.lifetimeValue > 25000 && (
                <span className="absolute top-0 left-0 right-0 h-1 gold-gradient-bg" />
              )}

              <div className="flex gap-4">
                <img
                  src={cust.photo}
                  alt={cust.name}
                  className="w-14 h-14 rounded-2xl border border-neutral-200 dark:border-neutral-800 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-poppins font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-gold-400 transition-colors">
                      {cust.name}
                    </h4>
                    {cust.lifetimeValue > 25000 && (
                      <span className="bg-gold-400/10 text-gold-400 border border-gold-400/25 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0">
                        VVIP
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-400 space-y-1 mt-2">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="truncate">{cust.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{cust.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* CRM quick totals */}
              <div className="flex justify-between items-end mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                <div>
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider leading-none">Lifetime Volume (LTV)</span>
                  <p className="text-sm font-bold text-gold-500 font-poppins mt-0.5">${cust.lifetimeValue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider leading-none">Purchase Logs</span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 font-mono">{getCustomerOrders(cust.id).length} bookings</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --------------------- MODAL: Add/Edit Customer --------------------- */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingCustomer ? 'Configure Client CRM Profile' : 'Register New Client Profile'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Full Legal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
            />
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
              <label className="font-semibold text-neutral-400">Secure Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">GST Registration Number</label>
              <input
                type="text"
                placeholder="27AAAAA1111A1Z1"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Shipping / Billing Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400 flex items-center gap-1">
                <Cake className="w-3.5 h-3.5 text-neutral-500" />
                <span>Birthday (YYYY-MM-DD)</span>
              </label>
              <input
                type="text"
                placeholder="1988-12-25"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-neutral-500" />
                <span>Marriage Anniversary</span>
              </label>
              <input
                type="text"
                placeholder="2012-05-18"
                value={formData.anniversary}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Internal CRM Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="e.g. Likes custom white gold chokers. Prefers direct bank transfers..."
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
              Authorize Save
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------- MODAL: Customer Profile details view --------------------- */}
      <Modal
        isOpen={!!viewCustomer}
        onClose={() => setSearchParams({})}
        title={viewCustomer ? `${viewCustomer.name} - Relations profile` : 'Customer Profile'}
        size="lg"
      >
        {viewCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-700 dark:text-neutral-300">
            {/* Left Info Summary */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={viewCustomer.photo}
                  alt={viewCustomer.name}
                  className="w-16 h-16 rounded-2xl border border-neutral-200 dark:border-neutral-800 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold font-poppins text-neutral-900 dark:text-white">{viewCustomer.name}</h3>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Registered: {viewCustomer.createdAt}</span>
                </div>
              </div>

              {/* LTV & Billing cards */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-3.5 bg-gold-400/5 rounded-xl border border-gold-400/10">
                  <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">LTV Purchase Pool</span>
                  <span className="font-poppins text-base font-extrabold text-gold-500">${viewCustomer.lifetimeValue.toLocaleString()}</span>
                </div>
                <div className="p-3.5 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Invoice GSTIN</span>
                  <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">{viewCustomer.gst || 'N/A'}</span>
                </div>
              </div>

              {/* Personal specs */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <span>Email</span>
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-800 dark:text-neutral-200 select-all">{viewCustomer.email}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span>Phone</span>
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono select-all">{viewCustomer.phone}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span>Address</span>
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-800 dark:text-neutral-200 truncate">{viewCustomer.address}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Cake className="w-4 h-4 text-neutral-500" />
                    <span>Birthday</span>
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono">{viewCustomer.birthday}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-neutral-500" />
                    <span>Anniversary</span>
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono">{viewCustomer.anniversary}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/50">
                <h5 className="font-semibold text-neutral-400 uppercase tracking-widest text-[9.5px]">Relations Executive Notes</h5>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed italic">"{viewCustomer.notes || 'No custom notes logged.'}"</p>
              </div>
            </div>

            {/* Right Booking History List */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  Historical Bookings
                </h4>
                
                {getCustomerOrders(viewCustomer.id).length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-neutral-500" />
                    <span>No orders tracked yet for this client.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {getCustomerOrders(viewCustomer.id).map(order => (
                      <div
                        key={order.id}
                        className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900 dark:text-white font-mono">{order.orderNumber}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">{order.orderDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gold-500">${order.totalAmount.toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider block mt-1 w-max ml-auto ${
                            order.deliveryStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                            order.deliveryStatus === 'Ready' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-gold-500/10 text-gold-400'
                          }`}>
                            {order.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite products section */}
              <div className="pt-2">
                <h5 className="font-semibold text-neutral-400 uppercase tracking-widest text-[9.5px] mb-2 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                  <span>Favorite designs watch</span>
                </h5>
                <div className="flex flex-wrap gap-1">
                  {viewCustomer.favoriteProducts.map(sku => (
                    <span key={sku} className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono text-[9px] uppercase">
                      {sku}
                    </span>
                  ))}
                  {viewCustomer.favoriteProducts.length === 0 && <span className="text-neutral-500 italic text-[10px]">No favorites set.</span>}
                </div>
              </div>

              {/* Admin modifications */}
              {isSalesOrAdmin && (
                <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => { setViewCustomer(null); handleOpenEdit(viewCustomer); }}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors"
                  >
                    Modify Card
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(viewCustomer.id, viewCustomer.name)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-semibold transition-all"
                  >
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
