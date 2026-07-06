import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  TrendingUp, 
  Boxes, 
  DollarSign, 
  Clock, 
  Hammer, 
  Calendar,
  ChevronDown,
  ArrowUpRight,
  UserCheck,
  Percent,
  CheckCircle,
  Gem
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export const AnalyticsDashboard: React.FC = () => {
  const { products, orders, jobs, purchaseOrders, customers } = useStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter items based on timeRange
  const filteredOrders = useMemo(() => {
    const today = new Date();
    let cutoffDate = new Date();
    if (timeRange === '7d') cutoffDate.setDate(today.getDate() - 7);
    else if (timeRange === '30d') cutoffDate.setDate(today.getDate() - 30);
    else if (timeRange === '90d') cutoffDate.setDate(today.getDate() - 90);
    else return orders;

    return orders.filter(o => new Date(o.orderDate) >= cutoffDate);
  }, [orders, timeRange]);

  // 1. KPI Computations
  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;
    
    // Inventory
    const totalStockQty = products.reduce((sum, p) => sum + p.stock, 0);
    const stockValuation = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
    
    // Manufacturing Cycle
    const completedJobs = jobs.filter(j => j.stage === 'Completed');
    let totalCycleDays = 0;
    completedJobs.forEach(j => {
      if (j.actualDate && j.startedAt) {
        const diffTime = Math.abs(new Date(j.actualDate).getTime() - new Date(j.startedAt).getTime());
        totalCycleDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    });
    const avgCycleDays = completedJobs.length > 0 ? Math.round(totalCycleDays / completedJobs.length) : 7;

    // Delayed jobs rate
    const totalJobs = jobs.length;
    const delayedJobs = jobs.filter(j => j.status === 'Delayed').length;
    const delayRate = totalJobs > 0 ? Math.round((delayedJobs / totalJobs) * 100) : 0;

    return {
      totalSales,
      avgOrderValue,
      totalStockQty,
      stockValuation,
      avgCycleDays,
      delayRate
    };
  }, [filteredOrders, products, jobs]);

  // 2. Sales Trend Chart Data
  const salesTrendData = useMemo(() => {
    const dataMap: Record<string, { date: string; Sales: number; Orders: number }> = {};
    
    filteredOrders.forEach(o => {
      const dateKey = o.orderDate;
      if (!dataMap[dateKey]) {
        dataMap[dateKey] = { date: dateKey, Sales: 0, Orders: 0 };
      }
      dataMap[dateKey].Sales += o.totalAmount;
      dataMap[dateKey].Orders += 1;
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  // 3. Category Distribution (Stock Value)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + (p.stock * p.sellingPrice);
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [products]);

  // 4. Craftsman Workload
  const craftsmanWorkload = useMemo(() => {
    const workload: Record<string, number> = {};
    jobs.filter(j => j.status !== 'Completed').forEach(j => {
      workload[j.craftsman] = (workload[j.craftsman] || 0) + 1;
    });
    return Object.keys(workload).map(key => ({
      name: key,
      value: workload[key]
    }));
  }, [jobs]);

  const COLORS = ['#D4AF37', '#7F00FF', '#00F0FF', '#FF007F', '#00FF66'];

  const triggerExcelExport = () => {
    const data = filteredOrders.map(o => ({
      'Order Number': o.orderNumber,
      'Customer': o.customerName,
      'Date': o.orderDate,
      'Value': o.totalAmount,
      'Status': o.deliveryStatus
    }));
    exportToExcel(data, 'Filtered Analytics Sales', `analytics_export_${timeRange}`);
  };

  const triggerPDFExport = () => {
    const headers = ['Order Number', 'Customer', 'Date', 'Value', 'Status'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      o.customerName,
      o.orderDate,
      `$${o.totalAmount.toLocaleString()}`,
      o.deliveryStatus
    ]);
    exportToPDF({
      title: `Auric Jewels - Analytics Overview (${timeRange})`,
      headers,
      rows,
      fileName: `analytics_pdf_${timeRange}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Advanced Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-neutral-400">Deep insights into business operations, inventory, and workshop performance.</p>
        </div>

        <div className="flex gap-2 text-xs font-semibold">
          <select 
            value={timeRange} 
            onChange={(e: any) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-800 dark:text-neutral-200"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All-time Records</option>
          </select>

          <button 
            onClick={triggerExcelExport}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            Export Excel
          </button>
          <button 
            onClick={triggerPDFExport}
            className="px-3.5 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Time-Range Sales</span>
          <h3 className="text-xl font-bold font-poppins text-neutral-900 dark:text-white mt-1">${metrics.totalSales.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active transactions</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Total Asset Value</span>
          <h3 className="text-xl font-bold font-poppins text-neutral-900 dark:text-white mt-1">${metrics.stockValuation.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
            <span>Units stocked:</span>
            <span className="font-bold text-neutral-900 dark:text-white">{metrics.totalStockQty} items</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Average Production Period</span>
          <h3 className="text-xl font-bold font-poppins text-neutral-900 dark:text-white mt-1">{metrics.avgCycleDays} Days</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimal craft efficiency</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Manufacturing Delay rate</span>
          <h3 className="text-xl font-bold font-poppins text-neutral-900 dark:text-white mt-1">{metrics.delayRate}%</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-semibold">
            <span>Active delay indicators</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col h-96">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Revenue Growth Trend</h4>
          <div className="flex-1 w-full text-[10px]">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-500">No transactions recorded in this window.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(18, 18, 18, 0.95)', 
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Area type="monotone" dataKey="Sales" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Share of categories */}
        <div className="glass-panel p-5 flex flex-col h-96">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Valuation by Category</h4>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(18, 18, 18, 0.95)', 
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-bold text-neutral-400">Asset Worth</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white font-poppins">${metrics.stockValuation.toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 font-semibold">
            {categoryData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-neutral-500 dark:text-neutral-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Workshops Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 flex flex-col h-80">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Workshop Craftsman Active Workload</h4>
          <div className="flex-1 w-full text-[10px]">
            {craftsmanWorkload.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-500">Workshop is currently idle.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={craftsmanWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(18, 18, 18, 0.95)', 
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                    {craftsmanWorkload.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead customer leaderboard */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">VVIP Client Leaderboard</h4>
            <div className="space-y-3.5">
              {customers.slice().sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 4).map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gold-400 font-mono">#0{idx + 1}</span>
                    <img src={c.photo} alt={c.name} className="w-8 h-8 rounded-lg shrink-0" />
                    <div>
                      <h5 className="font-semibold text-xs text-neutral-900 dark:text-white leading-snug">{c.name}</h5>
                      <span className="text-[10px] text-neutral-400 font-mono">{c.phone}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-gold-500">${c.lifetimeValue.toLocaleString()} LTV</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
