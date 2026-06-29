import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  Receipt, 
  Search, 
  Plus, 
  Clock, 
  CreditCard, 
  Truck, 
  Printer, 
  Trash2, 
  Eye, 
  FileText, 
  User, 
  Package, 
  ShoppingBag, 
  X,
  FileCheck,
  CheckCircle,
  Gem,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, Product, Customer } from '../utils/seedData';

export const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    orders, 
    products, 
    customers, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    user, 
    settings,
    bookmarks,
    toggleBookmark
  } = useStore();
  
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/orders');

  const viewId = searchParams.get('view');
  const addTrigger = searchParams.get('add');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [invoicePrintOpen, setInvoicePrintOpen] = useState(false);

  // Synced View State
  useEffect(() => {
    if (viewId) {
      const found = orders.find(o => o.id === viewId);
      if (found) {
        setViewOrder(found);
      }
    } else {
      setViewOrder(null);
    }
  }, [viewId, orders]);

  useEffect(() => {
    if (addTrigger === 'true') {
      handleOpenAdd();
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [addTrigger, searchParams, setSearchParams]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cartItems, setCartItems] = useState<Array<{
    productId: string;
    quantity: number;
    customInstructions?: string;
  }>>([]);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [isQuotation, setIsQuotation] = useState(false);

  // Cart Add Helper
  const [tempProductId, setTempProductId] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempCustom, setTempCustom] = useState('');

  const addToCart = () => {
    if (!tempProductId) return;
    const existing = cartItems.find(item => item.productId === tempProductId);
    if (existing) {
      setCartItems(cartItems.map(item => item.productId === tempProductId ? {
        ...item,
        quantity: item.quantity + tempQuantity
      } : item));
    } else {
      setCartItems([...cartItems, {
        productId: tempProductId,
        quantity: tempQuantity,
        customInstructions: tempCustom || undefined
      }]);
    }
    setTempProductId('');
    setTempQuantity(1);
    setTempCustom('');
    success('Product Added', 'Item added to the order checkout cart.');
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(i => i.productId !== id));
  };

  // Resolve Cart Details (weights, pricing)
  const cartTotals = useMemo(() => {
    let price = 0;
    let weight = 0;
    const resolvedItems = cartItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return null;
      price += p.sellingPrice * item.quantity;
      weight += p.weight * item.quantity;
      return {
        ...item,
        name: p.name,
        sku: p.sku,
        price: p.sellingPrice,
        weight: p.weight
      };
    }).filter(Boolean);

    return {
      items: resolvedItems as any[],
      totalPrice: price,
      totalWeight: parseFloat(weight.toFixed(2))
    };
  }, [cartItems, products]);

  // Open Checkout
  const handleOpenAdd = () => {
    setSelectedCustomerId(customers[0]?.id || '');
    setCartItems([]);
    setNotes('');
    setPaymentStatus('Unpaid');
    setIsQuotation(false);
    
    // Set 14 days expected delivery
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 14);
    setExpectedDelivery(expDate.toISOString().split('T')[0]);
    
    setFormOpen(true);
  };

  // Submit Order Checkout
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      error('Checkout Error', 'Please select or register a customer first.');
      return;
    }
    if (cartItems.length === 0) {
      error('Cart Empty', 'Please append at least 1 jewelry item to check out.');
      return;
    }

    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (!customer) return;

      const orderData = {
        customerId: customer.id,
        customerName: customer.name,
        items: cartTotals.items,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery,
        paymentStatus,
        deliveryStatus: isQuotation ? ('Pending' as const) : ('Pending' as const),
        notes,
        attachments: [],
        isQuotation
      };

      await addOrder(orderData);
      
      success(
        isQuotation ? 'Quotation Registered' : 'Order Booking Placed', 
        `Receipt successfully created and logged under customer registry.`
      );
      setFormOpen(false);
    } catch (err) {
      error('Booking Error', 'Check vault logs for error metrics.');
    }
  };

  // Transition Order status
  const handleStatusChange = async (order: Order, field: 'deliveryStatus' | 'paymentStatus', val: string) => {
    const updated = {
      ...order,
      [field]: val
    };
    await updateOrder(updated);
    success('Order Updated', `Successfully updated order status parameters.`);
  };

  // Delete Order
  const handleDeleteOrder = async (id: string) => {
    if (confirm('Cancel and delete this order booking from CRM metrics?')) {
      await deleteOrder(id);
      success('Booking Purged', 'Order record purged from ledger database.');
      if (viewId === id) {
        searchParams.delete('view');
        setSearchParams(searchParams);
      }
    }
  };

  // Filter list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? o.deliveryStatus === statusFilter : true;
      const matchPayment = paymentFilter ? o.paymentStatus === paymentFilter : true;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const isSales = user?.role === 'Sales Executive' || user?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Customer Orders & Quotes</span>
            <Receipt className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Manage client purchase contracts, generate quotations, and print invoices</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => toggleBookmark('/orders')}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-gold-400/10 border-gold-400/35 text-gold-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          {isSales && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs shadow-md shadow-gold-500/10 hover:shadow-gold-500/25 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Book Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search order ID, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Shipping Stages</option>
            <option value="Pending">Pending</option>
            <option value="Casting">Casting</option>
            <option value="Polishing">Polishing</option>
            <option value="Setting">Stone Setting</option>
            <option value="QC">Quality Check</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300 font-semibold"
          >
            <option value="">All Payment statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="glass-panel py-20 text-center text-neutral-400 text-sm flex flex-col items-center justify-center gap-2">
          <Receipt className="w-12 h-12 text-gold-400/50" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">No Orders Tracked</h4>
          <span>Confirm query or record a new client booking.</span>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">Order Coordinate</th>
                  <th className="p-4">Customer Client</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Process Stage</th>
                  <th className="p-4">Billing Status</th>
                  <th className="p-4">Revenue Net</th>
                  <th className="p-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {filteredOrders.map((ord) => (
                  <tr 
                    key={ord.id} 
                    onClick={() => setSearchParams({ view: ord.id })}
                    className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                      <span>{ord.orderNumber}</span>
                      {ord.isQuotation && (
                        <span className="bg-blue-400/10 text-blue-400 border border-blue-400/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0">
                          QUOTE
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200">{ord.customerName}</td>
                    <td className="p-4 font-mono text-neutral-500">{ord.orderDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        ord.deliveryStatus === 'Delivered' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                        ord.deliveryStatus === 'Cancelled' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                        ord.deliveryStatus === 'Ready' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20 animate-pulse' :
                        'bg-gold-400/15 text-gold-400 border-gold-400/20'
                      }`}>
                        {ord.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        ord.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                        ord.paymentStatus === 'Partial' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
                        'bg-rose-500/15 text-rose-400 border-rose-500/20'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gold-500">${ord.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewOrder(ord);
                          setInvoicePrintOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/30 text-neutral-400 hover:text-white transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: Order Placement Form --------------------- */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Luxury Checkout - Place Order Booking"
        size="lg"
      >
        <form onSubmit={handleOrderSubmit} className="space-y-5 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Picker */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Select Customer Profile</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            {/* Expected Date */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Expected Delivery Target</label>
              <input
                type="date"
                required
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Cart appending controls */}
          <div className="p-4 bg-neutral-100 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-4">
            <h4 className="font-poppins font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
              <span>Checkout Shopping Cart Builder</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase">Select Catalog Item</label>
                <select
                  value={tempProductId}
                  onChange={(e) => setTempProductId(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none"
                >
                  <option value="">-- select item --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.sellingPrice.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none font-mono"
                />
              </div>

              <div className="space-y-1 flex items-end">
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!tempProductId}
                  className="w-full py-2.5 rounded-xl border border-gold-400/35 hover:bg-gold-400/10 text-gold-400 font-bold transition-all disabled:opacity-40"
                >
                  Append to Cart
                </button>
              </div>
            </div>

            {/* Custom sizing engraving instructions */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase">Customization / Engraving Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Size 7, Engrave 'A & V' inside band"
                value={tempCustom}
                onChange={(e) => setTempCustom(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none"
              />
            </div>

            {/* Cart Items listing */}
            {cartItems.length > 0 && (
              <div className="border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl divide-y divide-neutral-200/50 dark:divide-neutral-800/50 overflow-hidden bg-white dark:bg-neutral-950">
                {cartItems.map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white">{p.name}</span>
                        <span className="text-[9px] text-neutral-400 font-mono block uppercase">{p.sku} {item.customInstructions ? `| "${item.customInstructions}"` : ''}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.quantity} x ${p.sellingPrice.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-rose-500 hover:text-rose-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Payment Terms</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-semibold"
              >
                <option value="Unpaid">Unpaid (Credit terms)</option>
                <option value="Partial">Partial (Advance paid)</option>
                <option value="Paid">Paid (Cash / Card Reconciled)</option>
              </select>
            </div>

            {/* Document scope */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-3 select-none">
                <input
                  type="checkbox"
                  checked={isQuotation}
                  onChange={(e) => setIsQuotation(e.target.checked)}
                  className="w-4 h-4 accent-gold-400 bg-neutral-50 border-neutral-800 rounded focus:ring-0"
                />
                <span className="font-semibold text-neutral-300">File as Quotation only (Estimate)</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Internal Order Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Shipping coordinator alerts or special package requests..."
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
            />
          </div>

          {/* Cart checkout details */}
          {cartItems.length > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-gold-400/5 border border-gold-400/20 text-xs">
              <span className="font-semibold text-neutral-400">Estimated Weight: <span className="font-mono text-neutral-800 dark:text-white">{cartTotals.totalWeight}g</span></span>
              <span className="font-semibold text-gold-400">Total Booking Price: <span className="font-poppins font-bold text-sm text-gold-500">${cartTotals.totalPrice.toLocaleString()}</span></span>
            </div>
          )}

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
              Book Order Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------- MODAL: Order Details / Visual timeline --------------------- */}
      <Modal
        isOpen={!!viewOrder && !invoicePrintOpen}
        onClose={() => setSearchParams({})}
        title={viewOrder ? `${viewOrder.orderNumber} - Order Details` : 'Order Details'}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-6 text-xs text-neutral-700 dark:text-neutral-300">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/50">
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Client Customer</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{viewOrder.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Order Date</span>
                <span className="font-mono text-neutral-800 dark:text-white">{viewOrder.orderDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Expected Target</span>
                <span className="font-mono text-neutral-800 dark:text-white">{viewOrder.expectedDelivery}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Actual Delivery</span>
                <span className="font-mono text-neutral-800 dark:text-white">{viewOrder.actualDelivery || 'In Progress'}</span>
              </div>
            </div>

            {/* Visual process timeline */}
            <div className="space-y-2">
              <h4 className="font-poppins font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Manufacturing & Delivery Status Timeline
              </h4>
              <div className="flex items-center justify-between pt-4 relative">
                {/* Visual Line */}
                <div className="absolute top-[35px] left-5 right-5 h-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />
                
                {['Pending', 'Casting', 'Polishing', 'Setting', 'QC', 'Ready', 'Delivered'].map((stage, idx) => {
                  const stageIndex = ['Pending', 'Casting', 'Polishing', 'Setting', 'QC', 'Ready', 'Delivered'].indexOf(viewOrder.deliveryStatus);
                  const isPassed = idx <= stageIndex;
                  const isCurrent = stage === viewOrder.deliveryStatus;

                  return (
                    <div key={stage} className="flex flex-col items-center z-10">
                      <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold font-mono text-xs ${
                        isPassed 
                          ? 'bg-gold-400 border-gold-400 text-neutral-950 shadow-md shadow-gold-500/10' 
                          : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500'
                      } ${isCurrent ? 'ring-4 ring-gold-400/20' : ''}`}>
                        {idx + 1}
                      </span>
                      <span className="text-[9px] font-semibold text-neutral-400 mt-1 uppercase tracking-wider">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart products sheet */}
            <div className="space-y-2">
              <h4 className="font-poppins font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Ordered Items Catalog
              </h4>
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                {viewOrder.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center p-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/10 transition-colors">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-white">{item.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono block uppercase">
                        {item.sku} {item.customInstructions ? `| "${item.customInstructions}"` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-neutral-700 dark:text-neutral-300">{item.quantity} x ${item.price.toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-400 block font-semibold">{item.weight * item.quantity}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="flex justify-between items-center p-4 bg-gold-400/5 border border-gold-400/20 rounded-xl">
              <div>
                <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Estimated GST Tax (3%)</span>
                <p className="font-mono font-bold text-neutral-800 dark:text-neutral-300 mt-0.5">
                  ${Math.round(viewOrder.totalAmount * 0.03).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gold-400 font-semibold uppercase tracking-wider">Total Contract Invoice</span>
                <p className="text-lg font-poppins font-extrabold text-gold-500 mt-0.5">
                  ${viewOrder.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Workflow controls */}
            {isSales && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                {/* Adjust delivery status */}
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Transition Shipping Coordinate</label>
                  <select
                    value={viewOrder.deliveryStatus}
                    onChange={(e) => handleStatusChange(viewOrder, 'deliveryStatus', e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Casting">Casting</option>
                    <option value="Polishing">Polishing</option>
                    <option value="Setting">Stone Setting</option>
                    <option value="QC">Quality Check</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Adjust billing status */}
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Transition Billing status</label>
                  <select
                    value={viewOrder.paymentStatus}
                    onChange={(e) => handleStatusChange(viewOrder, 'paymentStatus', e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {/* Trigger Invoice Print */}
                <div className="flex items-end gap-1.5 shrink-0 mt-3 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => setInvoicePrintOpen(true)}
                    className="w-full py-2 px-4 rounded-xl border border-gold-400/35 hover:bg-gold-400/10 text-gold-400 font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4.5 h-4.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(viewOrder.id)}
                    className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* --------------------- MODAL: Invoice Print View --------------------- */}
      <Modal
        isOpen={invoicePrintOpen}
        onClose={() => setInvoicePrintOpen(false)}
        title="Print Preview / Invoice Receipt"
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-6 text-xs p-6 bg-white text-neutral-950 rounded-2xl shadow-xl relative border border-neutral-100">
            {/* Stamp Logo */}
            <div className="flex justify-between items-start border-b border-neutral-200 pb-5">
              <div>
                <h2 className="text-xl font-poppins font-extrabold tracking-widest text-neutral-900 flex items-center gap-1.5">
                  <span className="bg-neutral-950 text-white p-1.5 rounded-lg"><Gem className="w-5 h-5 text-gold-400" /></span>
                  <span>AURIC JEWELS</span>
                </h2>
                <p className="text-[9px] text-neutral-400 font-semibold tracking-widest font-poppins mt-0.5">EXQUISITE LUXURY HERITAGE</p>
                <div className="text-[10px] text-neutral-500 mt-2 space-y-0.5 leading-relaxed font-sans">
                  <p>101, Diamond Avenue, Bandra Kurla Complex</p>
                  <p>Mumbai, Maharashtra - 400051</p>
                  <p>GSTIN: 27AURIC7890C1Z9</p>
                </div>
              </div>

              <div className="text-right">
                <h4 className="text-lg font-bold font-poppins text-neutral-800 uppercase tracking-widest">
                  {viewOrder.isQuotation ? 'QUOTATION ESTIMATE' : 'TAX INVOICE'}
                </h4>
                <p className="font-mono text-sm font-bold text-neutral-700 mt-1">{viewOrder.orderNumber}</p>
                <div className="text-[10px] text-neutral-500 mt-3 space-y-0.5 font-mono">
                  <p>Date: {viewOrder.orderDate}</p>
                  <p>Expected: {viewOrder.expectedDelivery}</p>
                  <p>Payment: {viewOrder.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* Client address */}
            <div>
              <h5 className="font-semibold text-neutral-400 uppercase tracking-wider text-[9px] mb-1">Billed & Shipped To</h5>
              <div className="font-sans text-[11px] leading-relaxed text-neutral-800">
                <p className="font-bold text-neutral-950">{viewOrder.customerName}</p>
                {customers.find(c => c.id === viewOrder.customerId) && (
                  <>
                    <p>{customers.find(c => c.id === viewOrder.customerId)?.address}</p>
                    <p>Phone: {customers.find(c => c.id === viewOrder.customerId)?.phone}</p>
                    <p className="font-mono">GSTIN: {customers.find(c => c.id === viewOrder.customerId)?.gst || 'N/A'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 text-neutral-400 font-semibold uppercase text-[9px] tracking-wider bg-neutral-50">
                  <th className="py-2.5 px-3">Catalog Item Details</th>
                  <th className="py-2.5 px-3 font-mono text-right">Net Wt</th>
                  <th className="py-2.5 px-3 font-mono text-right">Qty</th>
                  <th className="py-2.5 px-3 font-mono text-right">Rate</th>
                  <th className="py-2.5 px-3 font-mono text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans text-neutral-800">
                {viewOrder.items.map(item => (
                  <tr key={item.productId}>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-950 block">{item.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono block uppercase">{item.sku} {item.customInstructions ? `| "${item.customInstructions}"` : ''}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{item.weight * item.quantity}g</td>
                    <td className="py-3 px-3 text-right font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">${item.price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-950">${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations right aligned */}
            <div className="w-full sm:w-1/2 ml-auto space-y-1.5 pt-4 border-t border-neutral-200 font-sans text-xs">
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Sub-Total Gross:</span>
                <span className="font-mono">${viewOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>CGST (1.5%):</span>
                <span className="font-mono">${Math.round(viewOrder.totalAmount * 0.015).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>SGST (1.5%):</span>
                <span className="font-mono">${Math.round(viewOrder.totalAmount * 0.015).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-900 font-extrabold text-sm border-t border-neutral-300 pt-2 font-poppins">
                <span>Grand Total:</span>
                <span className="text-gold-600 font-bold font-mono">${(viewOrder.totalAmount + Math.round(viewOrder.totalAmount * 0.03)).toLocaleString()}</span>
              </div>
            </div>

            {/* Bottom Signature notes */}
            <div className="pt-8 border-t border-neutral-200 flex justify-between items-end text-[9px] text-neutral-400 font-sans leading-relaxed">
              <div>
                <p className="font-semibold text-neutral-700">Terms & Conditions:</p>
                <p>1. Certified goods once sold cannot be returned without strict verification.</p>
                <p>2. Subject to Mumbai Jurisdiction.</p>
              </div>
              <div className="text-center font-medium font-poppins shrink-0">
                <span className="border-t border-neutral-300 block w-24 pt-1 text-neutral-700 font-bold uppercase tracking-wider">Authorized Seal</span>
              </div>
            </div>

            {/* Print action trigger */}
            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 no-print">
              <button
                type="button"
                onClick={() => setInvoicePrintOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Execute System Print</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
