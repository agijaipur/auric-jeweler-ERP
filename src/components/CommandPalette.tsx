import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Sparkles, User, Package, FileText, ArrowRight, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product, Customer, Order } from '../utils/seedData';
import { AnimatePresence, motion } from 'framer-motion';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { products, customers, orders, commandPaletteOpen, setCommandPaletteOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    products: Product[];
    customers: Customer[];
    orders: Order[];
    aiInsights: string[];
  }>({ products: [], customers: [], orders: [], aiInsights: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [commandPaletteOpen]);

  // Handle Search and NLP Logic
  useEffect(() => {
    if (!query) {
      setResults({ products: [], customers: [], orders: [], aiInsights: [] });
      return;
    }

    const q = query.toLowerCase();

    // Standard searches
    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.metal.toLowerCase().includes(q) ||
        p.stoneType.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedOrders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    ).slice(0, 5);

    // Natural Language Search Simulation
    const aiInsights: string[] = [];
    if (q.includes('gold') && q.includes('ring')) {
      aiInsights.push('Filter: Show Gold Rings (22K, 24K and 18K Yellow Gold)');
    }
    if (q.includes('pending') || q.includes('incomplete')) {
      aiInsights.push('Filter: Show Pending orders currently in manufacturing / dispatch queue');
    }
    if (q.includes('diamond') || q.includes('gemstone')) {
      aiInsights.push('Filter: Show certified Diamond luxury chokers and solitaire rings');
    }
    if (q.includes('low') || q.includes('out of stock') || q.includes('restock')) {
      aiInsights.push('Filter: List items with stock level below alert thresholds (< 4 items)');
    }

    setResults({
      products: matchedProducts,
      customers: matchedCustomers,
      orders: matchedOrders,
      aiInsights,
    });
  }, [query, products, customers, orders]);

  const handleNavigate = (path: string, searchParam?: string) => {
    setCommandPaletteOpen(false);
    if (searchParam) {
      navigate(`${path}?search=${encodeURIComponent(searchParam)}`);
    } else {
      navigate(path);
    }
  };

  const handleItemClick = (type: 'product' | 'customer' | 'order', id: string, name: string) => {
    setCommandPaletteOpen(false);
    if (type === 'product') {
      navigate(`/products?view=${id}`);
    } else if (type === 'customer') {
      navigate(`/customers?view=${id}`);
    } else if (type === 'order') {
      navigate(`/orders?view=${id}`);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl glass-panel bg-neutral-900/95 dark:bg-luxury-black/95 border-gold-400/30 shadow-2xl overflow-hidden flex flex-col text-white"
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
              <Search className="w-5 h-5 text-gold-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search catalog, clients, or ask AI (e.g. 'Show low stock bracelets')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none ring-0 placeholder-neutral-500 text-sm font-sans"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="w-4 h-4 text-neutral-400 hover:text-white" />
                </button>
              )}
              <div className="text-[10px] text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded uppercase font-semibold select-none shrink-0">
                ESC
              </div>
            </div>

            {/* Results Panel */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 divide-y divide-neutral-800 scrollbar-thin">
              {!query && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[11px] font-semibold text-gold-400 uppercase tracking-widest px-2 mb-2 font-poppins">
                      Suggested Quick Actions
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => handleNavigate('/products')}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-800/40 hover:border-gold-400/20 text-left transition-all"
                      >
                        <span className="font-medium text-neutral-200">Catalog Registry</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleNavigate('/orders')}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-800/40 hover:border-gold-400/20 text-left transition-all"
                      >
                        <span className="font-medium text-neutral-200">Process Customer Order</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleNavigate('/production')}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-800/40 hover:border-gold-400/20 text-left transition-all"
                      >
                        <span className="font-medium text-neutral-200">Production Pipeline</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleNavigate('/ai-assistant')}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-800/40 hover:border-gold-400/20 text-left transition-all"
                      >
                        <span className="font-medium text-neutral-200">Consult AI Dashboard Insights</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-semibold text-gold-400 uppercase tracking-widest px-2 mb-2 font-poppins">
                      Natural Language Search Examples
                    </h5>
                    <ul className="text-xs text-neutral-400 space-y-2 px-2">
                      <li
                        onClick={() => setQuery('Show gold rings')}
                        className="cursor-pointer hover:text-white flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-gold-400 shrink-0" />
                        <span>"Show gold rings"</span>
                      </li>
                      <li
                        onClick={() => setQuery('Pending orders')}
                        className="cursor-pointer hover:text-white flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-gold-400 shrink-0" />
                        <span>"Pending orders"</span>
                      </li>
                      <li
                        onClick={() => setQuery('Low stock bracelets')}
                        className="cursor-pointer hover:text-white flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-gold-400 shrink-0" />
                        <span>"Low stock bracelets"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {query && (
                <div className="space-y-4 pt-2">
                  {/* AI NLP insights */}
                  {results.aiInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (insight.includes('Rings')) handleNavigate('/products', 'gold rings');
                        else if (insight.includes('orders')) handleNavigate('/orders', 'pending');
                        else if (insight.includes('stock')) handleNavigate('/inventory', 'low stock');
                        else if (insight.includes('Diamond')) handleNavigate('/products', 'diamond');
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs cursor-pointer hover:bg-gold-400/15 transition-all"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                      <div className="flex-1 font-medium">{insight}</div>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </div>
                  ))}

                  {/* Products */}
                  {results.products.length > 0 && (
                    <div>
                      <h6 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest px-2 mb-2">
                        Products ({results.products.length})
                      </h6>
                      <div className="space-y-1">
                        {results.products.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleItemClick('product', p.id, p.name)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 cursor-pointer text-xs transition-colors"
                          >
                            <Package className="w-4 h-4 text-gold-400 shrink-0" />
                            <div className="flex-1 truncate">
                              <span className="font-semibold text-neutral-200">{p.name}</span>
                              <span className="text-[10px] text-neutral-500 ml-2 font-mono">{p.sku}</span>
                            </div>
                            <div className="font-mono text-gold-400 font-semibold">${p.sellingPrice.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers */}
                  {results.customers.length > 0 && (
                    <div className="pt-3">
                      <h6 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest px-2 mb-2">
                        Customers ({results.customers.length})
                      </h6>
                      <div className="space-y-1">
                        {results.customers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleItemClick('customer', c.id, c.name)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 cursor-pointer text-xs transition-colors"
                          >
                            <User className="w-4 h-4 text-gold-400 shrink-0" />
                            <div className="flex-1 truncate">
                              <span className="font-semibold text-neutral-200">{c.name}</span>
                              <span className="text-[10px] text-neutral-500 ml-2">{c.email}</span>
                            </div>
                            <div className="text-[10px] text-neutral-400">LTV: ${c.lifetimeValue.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {results.orders.length > 0 && (
                    <div className="pt-3">
                      <h6 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest px-2 mb-2">
                        Orders ({results.orders.length})
                      </h6>
                      <div className="space-y-1">
                        {results.orders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => handleItemClick('order', o.id, o.orderNumber)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 cursor-pointer text-xs transition-colors"
                          >
                            <FileText className="w-4 h-4 text-gold-400 shrink-0" />
                            <div className="flex-1 truncate">
                              <span className="font-semibold text-neutral-200">{o.orderNumber}</span>
                              <span className="text-[10px] text-neutral-500 ml-2">by {o.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                o.deliveryStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                o.deliveryStatus === 'Ready' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                              }`}>
                                {o.deliveryStatus}
                              </span>
                              <span className="font-mono text-neutral-200">${o.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {results.products.length === 0 &&
                    results.customers.length === 0 &&
                    results.orders.length === 0 &&
                    results.aiInsights.length === 0 && (
                      <div className="text-center py-6 text-neutral-500 text-xs">
                        No matches found for <span className="font-semibold text-neutral-300">"{query}"</span>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-900 text-[10px] text-neutral-400">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>⏎ Select</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Ctrl + K to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
