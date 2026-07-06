import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Truck,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PurchaseOrder, Product } from '../utils/seedData';
import { generatePOInvoicePDF } from '../utils/exportUtils';

export const PurchaseOrders: React.FC = () => {
  const { 
    purchaseOrders, 
    suppliers, 
    products, 
    addPurchaseOrder, 
    updatePurchaseOrder, 
    deletePurchaseOrder,
    receivePurchaseOrder,
    verifyPurchaseOrder,
    user 
  } = useStore();
  const { success, warning, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'All' | 'Draft' | 'Sent' | 'Pending Verification' | 'Completed'>('All');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Form State - Create PO
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; qty: number; unitCost: number }[]>([]);
  const [expectedDays, setExpectedDays] = useState(7);
  const [poRemarks, setPoRemarks] = useState('');

  // Form State - Quantities checking
  const [qtyInputs, setQtyInputs] = useState<{ productId: string; qty: number }[]>([]);

  // Computed PO List
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusTab === 'All' ? true : po.status === statusTab;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusTab]);

  const stats = useMemo(() => {
    const totalCount = purchaseOrders.length;
    const pendingVerification = purchaseOrders.filter(po => po.status === 'Pending Verification').length;
    const completedCount = purchaseOrders.filter(po => po.status === 'Completed').length;
    return { totalCount, pendingVerification, completedCount };
  }, [purchaseOrders]);

  // Actions
  const handleOpenCreate = () => {
    if (suppliers.length === 0) {
      warning('Prerequisite Missing', 'Please add at least one supplier before creating purchase orders.');
      return;
    }
    setSelectedSupplierId(suppliers[0].id);
    setPoItems([]);
    setPoRemarks('');
    setCreateOpen(true);
  };

  const addPoItemLine = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setPoItems([...poItems, { 
      productId: defaultProduct.id, 
      qty: 10, 
      unitCost: Math.round(defaultProduct.sellingPrice * 0.7) 
    }]);
  };

  const updatePoItemLine = (idx: number, field: string, val: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        updated[idx] = { 
          productId: val, 
          qty: updated[idx].qty, 
          unitCost: Math.round(prod.sellingPrice * 0.7) 
        };
      }
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    setPoItems(updated);
  };

  const removePoItemLine = (idx: number) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      error('Empty Order', 'Please add at least one item line to this Purchase Order.');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const itemsFormatted = poItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        sku: prod?.sku || 'N/A',
        name: prod?.name || 'N/A',
        orderedQty: item.qty,
        receivedQty: 0,
        verifiedQty: 0,
        unitCost: item.unitCost,
        weight: prod?.weight || 0
      };
    });

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + expectedDays);

    await addPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: itemsFormatted,
      status: 'Sent', // Send immediately in simulation
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDate.toISOString().split('T')[0],
      notes: poRemarks,
      createdBy: user?.email || 'inventory@auric.com'
    });

    success('Purchase Order Generated', 'PO created and marked as Sent.');
    setCreateOpen(false);
  };

  // Goods receipt flow
  const handleOpenReceive = (po: PurchaseOrder) => {
    setSelectedPO(po);
    const inputs = po.items.map(item => ({
      productId: item.productId,
      qty: item.orderedQty // default fill matches order
    }));
    setQtyInputs(inputs);
    setReceiveOpen(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    await receivePurchaseOrder(selectedPO.id, qtyInputs);
    success('Inventory Dispatched', 'Items received. Status transitioned to Pending Verification.');
    setReceiveOpen(false);
  };

  // Verification flow (Admin/IM only)
  const handleOpenVerify = (po: PurchaseOrder) => {
    setSelectedPO(po);
    const inputs = po.items.map(item => ({
      productId: item.productId,
      qty: item.receivedQty
    }));
    setQtyInputs(inputs);
    setVerifyOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    await verifyPurchaseOrder(selectedPO.id, qtyInputs);
    success('Physical Reconciliation Complete', 'Stock verified. Vault inventory has been updated automatically.');
    setVerifyOpen(false);
  };

  const handlePrintPO = (po: PurchaseOrder) => {
    generatePOInvoicePDF(po);
    success('Invoice PDF Generated', `Downloaded details for PO ${po.poNumber}`);
  };

  const isVerifier = user?.role === 'Administrator' || user?.role === 'Inventory Manager';

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Purchase Order Management</span>
            <Layers className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Order inventory materials and verify physical receipts under compliance controls</p>
        </div>

        <div className="flex gap-2 text-xs font-semibold">
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Generate PO</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Procured POs</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins">{stats.totalCount} Orders</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Awaiting Verification</span>
            <span className="text-lg font-bold text-amber-500 font-poppins">{stats.pendingVerification} Pending</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Fully Reconciled POs</span>
            <span className="text-lg font-bold text-emerald-500 font-poppins">{stats.completedCount} Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-px text-xs font-semibold">
        {(['All', 'Draft', 'Sent', 'Pending Verification', 'Completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              statusTab === tab
                ? 'border-gold-400 text-gold-500 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter and search */}
      <div className="glass-panel p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search PO number or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Delivery Date</th>
                <th className="p-4">Cost Value</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredPOs.map((po) => {
                const statusColors: Record<string, string> = {
                  Draft: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
                  Sent: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  'Pending Verification': 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
                  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                };

                return (
                  <tr key={po.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4 font-mono font-semibold text-neutral-900 dark:text-white">{po.poNumber}</td>
                    <td className="p-4 font-medium">{po.supplierName}</td>
                    <td className="p-4 font-mono text-neutral-500">{po.expectedDelivery}</td>
                    <td className="p-4 font-mono font-semibold text-gold-500">${po.totalCost.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9.5px] font-bold uppercase ${statusColors[po.status]}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {po.status === 'Sent' && (
                        <button
                          onClick={() => handleOpenReceive(po)}
                          className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-semibold"
                        >
                          Receive
                        </button>
                      )}
                      {po.status === 'Pending Verification' && (
                        <button
                          onClick={() => handleOpenVerify(po)}
                          className={`px-2 py-1 rounded text-amber-400 border border-amber-500/20 font-semibold ${
                            isVerifier ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'opacity-40 cursor-not-allowed'
                          }`}
                          disabled={!isVerifier}
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintPO(po)}
                        className="p-1 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------- MODAL: Generate PO --------------------- */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Generate Purchase Order"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Supplier Connection</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400">Expected Lead Days</label>
              <input
                type="number"
                min="1"
                required
                value={expectedDays}
                onChange={(e) => setExpectedDays(parseInt(e.target.value) || 7)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-400">Order Item Lines</span>
              <button
                type="button"
                onClick={addPoItemLine}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {poItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <select
                    value={item.productId}
                    onChange={(e) => updatePoItemLine(idx, 'productId', e.target.value)}
                    className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-1.5 px-2 outline-none text-neutral-800 dark:text-neutral-200"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    required
                    value={item.qty}
                    onChange={(e) => updatePoItemLine(idx, 'qty', parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-1.5 px-2 outline-none text-neutral-800 dark:text-neutral-200 font-mono"
                  />

                  <input
                    type="number"
                    min="1"
                    required
                    value={item.unitCost}
                    onChange={(e) => updatePoItemLine(idx, 'unitCost', parseInt(e.target.value) || 0)}
                    placeholder="Cost"
                    className="w-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-1.5 px-2 outline-none text-neutral-800 dark:text-neutral-200 font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => removePoItemLine(idx)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400">Order Remarks</label>
            <textarea
              rows={2}
              value={poRemarks}
              onChange={(e) => setPoRemarks(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
            >
              Dispatch Order
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------- MODAL: Receive Goods --------------------- */}
      <Modal
        isOpen={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        title={`Receive Goods - ${selectedPO?.poNumber}`}
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Standard Warning</span>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Entering received counts will place this PO in a <b>Pending Verification</b> state. Vault inventory will <b>NOT</b> be updated until authorized verification is complete.</p>
          </div>

          <div className="space-y-2">
            {selectedPO?.items.map((item, idx) => (
              <div key={item.productId} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="font-semibold block">{item.name}</span>
                  <span className="text-[9px] text-neutral-400 font-mono">Ordered: {item.orderedQty} units</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Received Count:</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={qtyInputs[idx]?.qty || 0}
                    onChange={(e) => {
                      const updated = [...qtyInputs];
                      updated[idx] = { productId: item.productId, qty: parseInt(e.target.value) || 0 };
                      setQtyInputs(updated);
                    }}
                    className="w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-1.5 px-2 outline-none text-neutral-800 dark:text-neutral-200 font-mono text-center"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setReceiveOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
            >
              Log Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------- MODAL: Verify Goods --------------------- */}
      <Modal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title={`Verify Physical Counts - ${selectedPO?.poNumber}`}
      >
        <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-2.5 items-start">
            <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gold-400 uppercase tracking-widest font-semibold block">Compliance Check</span>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">Please confirm exact quantities. Confirming verification will automatically increment vault inventory stock levels and log audit trails.</p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedPO?.items.map((item, idx) => (
              <div key={item.productId} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="font-semibold block">{item.name}</span>
                  <div className="flex gap-2.5 text-[9px] text-neutral-400 font-mono mt-0.5">
                    <span>Ordered: {item.orderedQty}</span>
                    <span>Received: {item.receivedQty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Verified Count:</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={qtyInputs[idx]?.qty || 0}
                    onChange={(e) => {
                      const updated = [...qtyInputs];
                      updated[idx] = { productId: item.productId, qty: parseInt(e.target.value) || 0 };
                      setQtyInputs(updated);
                    }}
                    className="w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-1.5 px-2 outline-none text-neutral-800 dark:text-neutral-200 font-mono text-center"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setVerifyOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
            >
              Verify & Update Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
