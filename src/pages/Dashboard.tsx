import React, { useMemo } from 'react';
import { PurchaseOrder, AppNotification } from '../utils/seedData';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Boxes, 
  DollarSign, 
  FileText, 
  Hammer, 
  AlertTriangle, 
  Package, 
  Clock, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  Zap,
  Bookmark,
  CheckCircle,
  Bell,
  ShoppingCart,
  Truck,
  ClipboardCheck
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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, orders, jobs, transactions, purchaseOrders, notifications, user, bookmarks, toggleBookmark } = useStore();

  const isBookmarked = bookmarks.includes('/');

  // 1. Calculate KPI Statistics
  const stats = useMemo(() => {
    const totalInventoryCount = products.reduce((sum, p) => sum + p.stock, 0);
    const inventoryVal = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled').length;
    const activeJobs = jobs.filter(j => j.status !== 'Completed').length;
    const completedOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
    
    // Revenue from paid / partially paid orders
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'Partial')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockAlerts = products.filter(p => p.stock < 5).length;

    const pendingVerification = purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Pending Verification').length;
    const activePOs = purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Ordered' || po.status === 'Pending Verification').length;
    const unreadNotifications = notifications.filter((n: AppNotification) => !n.read).length;

    return {
      totalInventoryCount,
      inventoryVal,
      totalOrders,
      pendingOrders,
      activeJobs,
      completedOrders,
      totalRevenue,
      lowStockAlerts,
      pendingVerification,
      activePOs,
      unreadNotifications
    };
  }, [products, orders, jobs, purchaseOrders, notifications]);

  // 2. Sales Trend Chart Data (Grouped by month for last 6 months)
  const salesChartData = useMemo(() => {
    // Generate months map
    const monthlyData: Record<string, { month: string; Sales: number; Orders: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed default structure for current year
    const currYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      monthlyData[mName] = { month: mName, Sales: 0, Orders: 0 };
    }

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const monthName = months[orderDate.getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].Sales += order.totalAmount;
        monthlyData[monthName].Orders += 1;
      }
    });

    return Object.values(monthlyData).reverse();
  }, [orders]);

  // 3. Category distribution (Inventory vs Sales Value)
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = { Rings: 0, Necklaces: 0, Bracelets: 0, Earrings: 0 };
    products.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category] += p.stock;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [products]);

  // 4. Low stock items
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock < 5).slice(0, 5);
  }, [products]);

  // 5. Recent activity logs (Merge transactions & orders)
  const recentActivity = useMemo(() => {
    const logs: Array<{ id: string; title: string; subtitle: string; time: string; type: string }> = [];
    
    // Add latest transactions
    transactions.slice(0, 4).forEach(tx => {
      logs.push({
        id: tx.id,
        title: `${tx.type} adjustment logged: ${tx.productName}`,
        subtitle: `Vault Transaction performed by ${tx.performedBy}`,
        time: tx.date,
        type: 'inventory'
      });
    });

    // Add latest orders
    orders.slice(0, 4).forEach(o => {
      logs.push({
        id: o.id,
        title: `Order Booked: ${o.orderNumber}`,
        subtitle: `Total amount: $${o.totalAmount.toLocaleString()} for client ${o.customerName}`,
        time: o.orderDate,
        type: 'order'
      });
    });

    // Sort by date desc
    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  }, [transactions, orders]);

  // Category Color Palette
  const COLORS = ['#D4AF37', '#b89222', '#e5bf26', '#E5E4E2'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Banner Dashboard Intro */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Administrative Dashboard</span>
            <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time analytics and luxury workflow tracking for Auric Jewels.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/')}
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Revenue */}
        <motion.div variants={cardVariants} className="glass-panel-gold p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="absolute top-[-30%] right-[-10%] w-24 h-24 rounded-full bg-gold-400/10 blur-xl group-hover:bg-gold-400/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-poppins">Sales Revenues</span>
            <div className="p-2 rounded-xl bg-gold-400/10 text-gold-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-poppins font-extrabold text-neutral-900 dark:text-white">
            ${stats.totalRevenue.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% from last month</span>
          </div>
        </motion.div>

        {/* KPI 2: Inventory Value */}
        <motion.div variants={cardVariants} className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="absolute top-[-30%] right-[-10%] w-24 h-24 rounded-full bg-neutral-400/5 blur-xl group-hover:bg-gold-400/5 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-poppins">Valuation Assets</span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-gold-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-poppins font-extrabold text-neutral-900 dark:text-white">
            ${stats.inventoryVal.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
            <span>Total Units stocked:</span>
            <span className="font-bold text-neutral-900 dark:text-white">{stats.totalInventoryCount}g</span>
          </div>
        </motion.div>

        {/* KPI 3: Orders booked */}
        <motion.div variants={cardVariants} className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="absolute top-[-30%] right-[-10%] w-24 h-24 rounded-full bg-neutral-400/5 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-poppins">Orders Ledger</span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-gold-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-poppins font-extrabold text-neutral-900 dark:text-white">
            {stats.totalOrders}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-gold-500 font-semibold">{stats.pendingOrders} Processing</span>
            <span className="text-neutral-400">|</span>
            <span className="text-emerald-500 font-semibold">{stats.completedOrders} Dispatched</span>
          </div>
        </motion.div>

        {/* KPI 4: Jobs queue */}
        <motion.div variants={cardVariants} className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="absolute top-[-30%] right-[-10%] w-24 h-24 rounded-full bg-neutral-400/5 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-poppins">Crafts Jobs</span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-gold-400">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-poppins font-extrabold text-neutral-900 dark:text-white">
            {stats.activeJobs}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-rose-500 font-semibold">
            {stats.lowStockAlerts > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{stats.lowStockAlerts} items running low stock</span>
              </>
            ) : (
              <span className="text-emerald-500">Workshop running optimally</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Action Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={cardVariants}
          onClick={() => navigate('/purchase-orders')}
          className="glass-panel p-4 flex items-center gap-3 cursor-pointer hover:border-gold-400/20 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Active POs</span>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">{stats.activePOs} orders</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 dark:text-neutral-600 group-hover:text-gold-400 transition-colors" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          onClick={() => navigate('/purchase-orders')}
          className="glass-panel p-4 flex items-center gap-3 cursor-pointer hover:border-amber-500/20 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Pending Verification</span>
            <p className={`text-sm font-bold ${stats.pendingVerification > 0 ? 'text-orange-500' : 'text-neutral-900 dark:text-white'}`}>
              {stats.pendingVerification} POs
            </p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 dark:text-neutral-600 group-hover:text-orange-400 transition-colors" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          onClick={() => navigate('/notifications')}
          className="glass-panel p-4 flex items-center gap-3 cursor-pointer hover:border-blue-500/20 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Unread Alerts</span>
            <p className={`text-sm font-bold ${stats.unreadNotifications > 0 ? 'text-blue-500' : 'text-neutral-900 dark:text-white'}`}>
              {stats.unreadNotifications} new
            </p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 dark:text-neutral-600 group-hover:text-blue-400 transition-colors" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          onClick={() => navigate('/suppliers')}
          className="glass-panel p-4 flex items-center gap-3 cursor-pointer hover:border-emerald-500/20 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Suppliers</span>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">Manage Vendors</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 dark:text-neutral-600 group-hover:text-emerald-400 transition-colors" />
        </motion.div>
      </div>

      {/* Main Charts & Visualizations Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <motion.div variants={cardVariants} className="glass-panel p-6 lg:col-span-2 flex flex-col h-96">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Sales Valuation Trend
              </h4>
              <p className="text-[11px] text-neutral-400">Monthly billing and gross revenues</p>
            </div>
          </div>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                <XAxis dataKey="month" stroke="#777" />
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
          </div>
        </motion.div>

        {/* Category distribution */}
        <motion.div variants={cardVariants} className="glass-panel p-6 flex flex-col h-96">
          <div>
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Inventory Share
            </h4>
            <p className="text-[11px] text-neutral-400">Units distributed across product types</p>
          </div>

          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
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

            {/* Custom Legend inside the chart circle area */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Stock</span>
              <span className="text-lg font-bold font-poppins text-neutral-900 dark:text-white">{stats.totalInventoryCount} u</span>
            </div>
          </div>

          {/* Color Indicators */}
          <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 font-semibold">
            {categoryChartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-neutral-500 dark:text-neutral-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Low stock alerts & Activity timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <motion.div variants={cardVariants} className="glass-panel p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Recent Operations Timeline
              </h4>
              <p className="text-[11px] text-neutral-400">Latest changes logged in CRM & stock vault</p>
            </div>
            <button
              onClick={() => navigate('/activity-logs')}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-neutral-200 dark:before:bg-neutral-800">
            {recentActivity.map((act) => (
              <div key={act.id} className="relative group text-xs">
                {/* Node circle */}
                <span className={`absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border border-white dark:border-neutral-950 ring-4 ring-neutral-50 dark:ring-luxury-black ${
                  act.type === 'inventory' ? 'bg-gold-400' : 'bg-emerald-500'
                }`} />

                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white leading-snug">{act.title}</h5>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{act.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium shrink-0 font-mono ml-4">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Watch */}
        <motion.div variants={cardVariants} className="glass-panel p-6 space-y-4">
          <div>
            <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Vault Under-Stock Alert
            </h4>
            <p className="text-[11px] text-neutral-400">Items below recommended count</p>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>All catalog products fully stocked.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => navigate(`/products?view=${prod.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-gold-400/20 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg shrink-0 border border-neutral-200 dark:border-neutral-800" />
                    <div className="min-w-0">
                      <h5 className="font-semibold text-xs text-neutral-900 dark:text-white truncate leading-snug">{prod.name}</h5>
                      <span className="text-[9px] text-neutral-500 font-mono uppercase">{prod.sku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-rose-500 font-mono">{prod.stock} u</span>
                    <p className="text-[8px] text-neutral-400">remaining</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
