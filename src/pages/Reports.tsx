import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Filter, 
  FileText, 
  Gem, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Clock, 
  Users,
  Bookmark
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

type ReportType = 'sales' | 'inventory' | 'production' | 'customers' | 'lowstock';

export const Reports: React.FC = () => {
  const { products, orders, jobs, customers, bookmarks, toggleBookmark } = useStore();
  const { success, error } = useToast();

  const isBookmarked = bookmarks.includes('/reports');

  // Report Select State
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<'all' | '30days' | '60days'>('all');

  // Export CSV Helper
  const exportToCSV = () => {
    try {
      let csvContent = '';
      let fileName = `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`;

      if (activeReport === 'sales') {
        const headers = ['Order Number', 'Customer Name', 'Order Date', 'Delivery Status', 'Payment Status', 'Total Amount ($)'];
        const rows = orders.map(o => [o.orderNumber, o.customerName, o.orderDate, o.deliveryStatus, o.paymentStatus, o.totalAmount]);
        csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      } else if (activeReport === 'inventory') {
        const headers = ['SKU', 'Product Name', 'Category', 'Metal', 'Weight (g)', 'Vault Stock (units)', 'Selling Price ($)', 'Valuation ($)'];
        const rows = products.map(p => [p.sku, p.name, p.category, p.metal, p.weight, p.stock, p.sellingPrice, p.sellingPrice * p.stock]);
        csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      } else if (activeReport === 'production') {
        const headers = ['Job ID', 'Product Name', 'Craftsman', 'Stage', 'Started Date', 'Target Date', 'Status', 'Progress (%)'];
        const rows = jobs.map(j => [j.jobId, j.productName, j.craftsman, j.stage, j.startedAt, j.expectedDate, j.status, j.progressBar]);
        csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      } else if (activeReport === 'customers') {
        const headers = ['Name', 'Email', 'Phone', 'Address', 'GSTIN', 'Lifetime Value ($)', 'Birthday'];
        const rows = customers.map(c => [c.name, c.email, c.phone, c.address, c.gst, c.lifetimeValue, c.birthday]);
        csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      } else if (activeReport === 'lowstock') {
        const headers = ['SKU', 'Product Name', 'Category', 'Location', 'Current Stock (units)'];
        const rows = products.filter(p => p.stock < 5).map(p => [p.sku, p.name, p.category, p.location, p.stock]);
        csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('CSV Export Succeeded', `Downloaded active report file: ${fileName}`);
    } catch (e) {
      error('Export Error', 'Failed to generate CSV binary download file.');
    }
  };

  // 1. Sales metrics
  const salesMetrics = useMemo(() => {
    // Sales grouped by category
    const salesCat: Record<string, number> = { Rings: 0, Necklaces: 0, Bracelets: 0, Earrings: 0 };
    orders.forEach(o => {
      o.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId || prod.sku === item.sku);
        const cat = p?.category || 'Rings';
        if (salesCat[cat] !== undefined) {
          salesCat[cat] += item.price * item.quantity;
        }
      });
    });

    return Object.keys(salesCat).map(key => ({
      name: key,
      Revenue: salesCat[key]
    }));
  }, [orders, products]);

  // 2. Inventory metrics
  const inventoryMetrics = useMemo(() => {
    // Value of stock grouped by category
    const stockCat: Record<string, number> = { Rings: 0, Necklaces: 0, Bracelets: 0, Earrings: 0 };
    products.forEach(p => {
      if (stockCat[p.category] !== undefined) {
        stockCat[p.category] += p.stock * p.sellingPrice;
      }
    });

    return Object.keys(stockCat).map(key => ({
      name: key,
      Value: stockCat[key]
    }));
  }, [products]);

  // 3. Low stock count
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock < 5);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>ERP Analytics & Reports</span>
            <BarChart3 className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Generate executive audits, export CSV ledgers, and examine charts</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/reports')}
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

      {/* Control panel row */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tab Selectors */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => setActiveReport('sales')}
            className={`px-3 py-2 rounded-xl border transition-all ${
              activeReport === 'sales'
                ? 'bg-gold-400/10 border-gold-400/30 text-gold-500 font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sales Ledger
          </button>
          <button
            onClick={() => setActiveReport('inventory')}
            className={`px-3 py-2 rounded-xl border transition-all ${
              activeReport === 'inventory'
                ? 'bg-gold-400/10 border-gold-400/30 text-gold-500 font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Inventory Wealth
          </button>
          <button
            onClick={() => setActiveReport('production')}
            className={`px-3 py-2 rounded-xl border transition-all ${
              activeReport === 'production'
                ? 'bg-gold-400/10 border-gold-400/30 text-gold-500 font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Workshop Output
          </button>
          <button
            onClick={() => setActiveReport('customers')}
            className={`px-3 py-2 rounded-xl border transition-all ${
              activeReport === 'customers'
                ? 'bg-gold-400/10 border-gold-400/30 text-gold-500 font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            CRM Clients LTV
          </button>
          <button
            onClick={() => setActiveReport('lowstock')}
            className={`px-3 py-2 rounded-xl border transition-all ${
              activeReport === 'lowstock'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Low Stock Alerts
          </button>
        </div>

        {/* Action Triggers */}
        <div className="flex gap-2 w-full md:w-auto text-xs shrink-0 font-bold flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-initial flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-initial flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => {
              let data: Record<string, any>[] = [];
              if (activeReport === 'sales') {
                data = orders.map(o => ({ OrderNo: o.orderNumber, Customer: o.customerName, Date: o.orderDate, Status: o.deliveryStatus, Payment: o.paymentStatus, Amount: o.totalAmount }));
              } else if (activeReport === 'inventory') {
                data = products.map(p => ({ SKU: p.sku, Name: p.name, Category: p.category, Metal: p.metal, Weight: p.weight, Stock: p.stock, Price: p.sellingPrice, Value: p.sellingPrice * p.stock }));
              } else if (activeReport === 'production') {
                data = jobs.map(j => ({ JobID: j.jobId, Product: j.productName, Craftsman: j.craftsman, Stage: j.stage, Started: j.startedAt, Target: j.expectedDate, Status: j.status, Progress: j.progressBar }));
              } else if (activeReport === 'customers') {
                data = customers.map(c => ({ Name: c.name, Email: c.email, Phone: c.phone, GSTIN: c.gst, LTV: c.lifetimeValue }));
              } else if (activeReport === 'lowstock') {
                data = products.filter(p => p.stock < 5).map(p => ({ SKU: p.sku, Name: p.name, Category: p.category, Location: p.location, Stock: p.stock }));
              }
              exportToExcel(data, `${activeReport}_report`, `${activeReport}_report`);
            }}
            className="flex-1 md:flex-initial flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => {
              let headers: string[] = [];
              let rows: string[][] = [];
              if (activeReport === 'sales') {
                headers = ['Order #', 'Customer', 'Date', 'Delivery', 'Payment', 'Amount'];
                rows = orders.map(o => [o.orderNumber, o.customerName, o.orderDate, o.deliveryStatus, o.paymentStatus, `$${o.totalAmount.toLocaleString()}`]);
              } else if (activeReport === 'inventory') {
                headers = ['SKU', 'Name', 'Category', 'Metal', 'Weight', 'Stock', 'Price'];
                rows = products.map(p => [p.sku, p.name, p.category, p.metal, `${p.weight}g`, `${p.stock}`, `$${p.sellingPrice.toLocaleString()}`]);
              } else if (activeReport === 'production') {
                headers = ['Job ID', 'Product', 'Craftsman', 'Stage', 'Status', 'Progress'];
                rows = jobs.map(j => [j.jobId, j.productName, j.craftsman, j.stage, j.status, `${j.progressBar}%`]);
              } else if (activeReport === 'customers') {
                headers = ['Name', 'Email', 'Phone', 'GSTIN', 'LTV'];
                rows = customers.map(c => [c.name, c.email, c.phone, c.gst, `$${c.lifetimeValue.toLocaleString()}`]);
              } else if (activeReport === 'lowstock') {
                headers = ['SKU', 'Name', 'Category', 'Location', 'Stock'];
                rows = products.filter(p => p.stock < 5).map(p => [p.sku, p.name, p.category, p.location, `${p.stock}`]);
              }
              exportToPDF({ title: `Auric Jewels - ${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report`, headers, rows, fileName: `${activeReport}_report` });
            }}
            className="flex-1 md:flex-initial flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-neutral-950 shadow-md shadow-gold-500/10"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Visualization graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Charts container */}
        <div className="glass-panel p-6 md:col-span-2 h-80 text-xs">
          <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-6">
            {activeReport.toUpperCase()} GRAPH ANALYSIS
          </h4>
          <div className="w-full h-[200px]">
            {activeReport === 'sales' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', color: '#fff' }} />
                  <Bar dataKey="Revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeReport === 'inventory' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', color: '#fff' }} />
                  <Bar dataKey="Value" fill="#E5E4E2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeReport === 'production' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobs.slice(0, 10).map(j => ({ name: j.jobId, progress: j.progressBar }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', color: '#fff' }} />
                  <Line type="monotone" dataKey="progress" stroke="#D4AF37" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeReport === 'customers' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customers.slice(0, 8).map(c => ({ name: c.name.split(' ')[0], LTV: c.lifetimeValue }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', color: '#fff' }} />
                  <Bar dataKey="LTV" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeReport === 'lowstock' && (
              <div className="h-full flex items-center justify-center text-center text-neutral-400 font-semibold italic">
                {lowStockItems.length} items currently running below restock limit coordinates.
              </div>
            )}
          </div>
        </div>

        {/* Small Metrics card */}
        <div className="glass-panel p-6 space-y-4">
          <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            EXECUTIVE AUDIT SUMMARY
          </h4>

          <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs">
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-neutral-400">Ledger Count</span>
              <span className="font-bold text-neutral-900 dark:text-white font-mono">
                {activeReport === 'sales' ? `${orders.length} orders` :
                 activeReport === 'inventory' ? `${products.length} products` :
                 activeReport === 'production' ? `${jobs.length} jobs` :
                 activeReport === 'customers' ? `${customers.length} clients` :
                 `${lowStockItems.length} alerts`}
              </span>
            </div>
            
            {activeReport === 'sales' && (
              <div className="flex justify-between items-center py-2 pt-4">
                <span className="font-semibold text-neutral-400">Total Inflow Value</span>
                <span className="font-bold text-gold-500 font-poppins text-sm">
                  ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </span>
              </div>
            )}

            {activeReport === 'inventory' && (
              <div className="flex justify-between items-center py-2 pt-4">
                <span className="font-semibold text-neutral-400">Total Vault Asset Value</span>
                <span className="font-bold text-gold-500 font-poppins text-sm">
                  ${products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Tables details list */}
      <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
        <div className="overflow-x-auto">
          {activeReport === 'sales' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">Order Coordinate</th>
                  <th className="p-4">Customer Client</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Process Stage</th>
                  <th className="p-4">Billing Status</th>
                  <th className="p-4 text-right">Revenue Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {orders.slice(0, 100).map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">{ord.orderNumber}</td>
                    <td className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">{ord.customerName}</td>
                    <td className="p-4 font-mono text-neutral-500">{ord.orderDate}</td>
                    <td className="p-4">{ord.deliveryStatus}</td>
                    <td className="p-4 font-semibold uppercase">{ord.paymentStatus}</td>
                    <td className="p-4 font-mono font-bold text-gold-500 text-right">${ord.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'inventory' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">SKU / Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Metal Spec</th>
                  <th className="p-4">Vault Location</th>
                  <th className="p-4 font-mono text-right">Vault Stock</th>
                  <th className="p-4 font-mono text-right">Unit Price</th>
                  <th className="p-4 font-mono text-right">Reconciled wealth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {products.slice(0, 100).map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-neutral-900 dark:text-white block truncate max-w-xs">{prod.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase">{prod.sku}</span>
                    </td>
                    <td className="p-4 font-semibold">{prod.category}</td>
                    <td className="p-4">{prod.metal} ({prod.purity})</td>
                    <td className="p-4 font-mono">{prod.location}</td>
                    <td className="p-4 font-mono text-right">{prod.stock} u</td>
                    <td className="p-4 font-mono text-right">${prod.sellingPrice.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-gold-500 text-right">${(prod.sellingPrice * prod.stock).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'production' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">Job ID</th>
                  <th className="p-4">Product details</th>
                  <th className="p-4">Craftsman</th>
                  <th className="p-4">Active Stage</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {jobs.slice(0, 100).map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">{job.jobId}</td>
                    <td className="p-4">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300 block truncate max-w-xs">{job.productName}</span>
                      {job.orderNumber && <span className="text-[10px] text-neutral-400 font-mono">Contract: {job.orderNumber}</span>}
                    </td>
                    <td className="p-4 font-semibold">{job.craftsman}</td>
                    <td className="p-4 font-semibold uppercase">{job.stage}</td>
                    <td className="p-4 font-mono">{job.expectedDate}</td>
                    <td className="p-4 font-mono font-bold text-right text-gold-500">{job.progressBar}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'customers' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4 font-mono text-right">Lifetime LTV Pool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {customers.slice(0, 100).map((cust) => (
                  <tr key={cust.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4 font-semibold text-neutral-900 dark:text-white">{cust.name}</td>
                    <td className="p-4 font-mono">{cust.email}</td>
                    <td className="p-4 font-mono">{cust.gst || 'N/A'}</td>
                    <td className="p-4 font-mono font-bold text-gold-500 text-right">${cust.lifetimeValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'lowstock' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                  <th className="p-4">SKU / Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Vault Location</th>
                  <th className="p-4 text-right">Physical Units Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
                {lowStockItems.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-neutral-900 dark:text-white block truncate max-w-xs">{prod.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase">{prod.sku}</span>
                    </td>
                    <td className="p-4 font-semibold">{prod.category}</td>
                    <td className="p-4 font-mono">{prod.location}</td>
                    <td className="p-4 font-mono font-bold text-rose-500 text-right">{prod.stock} u</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
