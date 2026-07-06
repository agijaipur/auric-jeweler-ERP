import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  Gem, 
  Layers, 
  Package, 
  RefreshCcw, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../utils/seedData';
import { QRCodeGenerator } from '../components/ui/QRCode';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, addProduct, updateProduct, deleteProduct, user, settings, bookmarks, toggleBookmark } = useStore();
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/products');

  // URL State Handles
  const viewId = searchParams.get('view');
  const addTrigger = searchParams.get('add');
  const searchQueryParam = searchParams.get('search');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(searchQueryParam || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [sortBy, setSortBy] = useState<'sku' | 'price-asc' | 'price-desc' | 'weight'>('sku');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit Form Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Sync state from query parameters
  useEffect(() => {
    if (viewId) {
      const found = products.find(p => p.id === viewId);
      if (found) {
        setViewProduct(found);
      }
    } else {
      setViewProduct(null);
    }
  }, [viewId, products]);

  useEffect(() => {
    if (addTrigger === 'true') {
      setEditingProduct(null);
      setFormOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [addTrigger, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchQueryParam) {
      setSearchTerm(searchQueryParam);
    }
  }, [searchQueryParam]);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rings' as Product['category'],
    metal: 'Yellow Gold' as Product['metal'],
    purity: '22K' as Product['purity'],
    weight: 0,
    stoneType: 'None' as Product['stoneType'],
    stoneWeight: 0,
    diamondDetails: 'N/A',
    certificationNumber: 'N/A',
    makingCharges: 15,
    sellingPrice: 0,
    description: '',
    image: '',
    tags: [] as string[],
    stock: 5,
    location: 'Vault-A-1'
  });

  // Autofill calculated selling price based on gold weights
  const goldRate = useMemo(() => {
    if (!settings) return 65; // fallback
    if (formData.purity === '24K') return settings.goldRate24K;
    if (formData.purity === '22K') return settings.goldRate22K;
    if (formData.purity === '18K') return settings.goldRate18K;
    if (formData.purity === 'PT950') return 45; // pt mock
    return 1.2; // silver
  }, [formData.purity, settings]);

  const calculatedSellingPrice = useMemo(() => {
    const rawMetalCost = formData.weight * goldRate;
    let stoneCost = 0;
    if (formData.stoneType === 'Diamond') {
      stoneCost = formData.stoneWeight * 1800;
    } else if (formData.stoneType !== 'None') {
      stoneCost = formData.stoneWeight * 150;
    }
    const makingCost = formData.weight * formData.makingCharges;
    const rawCost = rawMetalCost + stoneCost + makingCost;
    return Math.round(rawCost * 1.35); // markup multiplier
  }, [formData.weight, formData.makingCharges, formData.stoneType, formData.stoneWeight, goldRate]);

  // Set selling price whenever factors change
  useEffect(() => {
    setFormData(prev => ({ ...prev, sellingPrice: calculatedSellingPrice }));
  }, [calculatedSellingPrice]);

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Rings',
      metal: 'Yellow Gold',
      purity: '22K',
      weight: 5.5,
      stoneType: 'None',
      stoneWeight: 0,
      diamondDetails: 'N/A',
      certificationNumber: 'N/A',
      makingCharges: 18,
      sellingPrice: 0,
      description: '',
      image: '',
      tags: [],
      stock: 5,
      location: 'Vault-A-1'
    });
    setFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      metal: p.metal,
      purity: p.purity,
      weight: p.weight,
      stoneType: p.stoneType,
      stoneWeight: p.stoneWeight,
      diamondDetails: p.diamondDetails,
      certificationNumber: p.certificationNumber,
      makingCharges: p.makingCharges,
      sellingPrice: p.sellingPrice,
      description: p.description,
      image: p.image,
      tags: p.tags,
      stock: p.stock,
      location: p.location
    });
    setFormOpen(true);
  };

  // AI Description Generator (Local Simulation)
  const generateAIDescription = () => {
    if (!formData.name) {
      warning('Inputs Incomplete', 'Please fill the product name first.');
      return;
    }
    const desc = `Authentic luxury design. Crafted in ${formData.metal} (${formData.purity}) featuring standard weight of ${formData.weight}g. Accented with stunning certified ${formData.stoneType !== 'None' ? `${formData.stoneWeight} carats of premium ${formData.stoneType}` : 'high-polish minimal texture'}. Finished under ISO-certified laboratory oversight with security certification code: ${formData.certificationNumber}. Guaranteed lifetime heritage value.`;
    setFormData(prev => ({ ...prev, description: desc }));
    success('AI Description Generated', 'Description written into product card.');
  };

  // AI Tag Generator (Local Simulation)
  const generateAITags = () => {
    const tags: string[] = [formData.category, formData.metal, formData.purity];
    if (formData.stoneType !== 'None') tags.push(formData.stoneType);
    if (formData.weight > 15) tags.push('Statement');
    if (formData.sellingPrice > 7000) tags.push('Legacy');
    setFormData(prev => ({ ...prev, tags }));
    success('AI Tags Suggestion', 'Applied recommended luxury tags.');
  };

  // Submit Product Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.weight <= 0) {
      error('Validation Failed', 'Product Name and Weight are required');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          ...editingProduct,
          ...formData,
        });
        success('Catalog Item Updated', `${formData.name} updated successfully.`);
      } else {
        // Auto-generate SKU based on counter
        const counter = products.filter(p => p.category === formData.category).length + 1;
        const prefix = formData.category.slice(0, 2).toUpperCase();
        const sku = `AUR-${prefix}-${formData.purity}-${String(counter).padStart(3, '0')}`;
        
        // Mock SVG base64 image if none provided
        const goldColor = formData.metal === 'Yellow Gold' ? '%23D4AF37' : formData.metal === 'Rose Gold' ? '%23E0A996' : formData.metal === 'Platinum' ? '%23E5E4E2' : '%23C0C0C0';
        let stoneColor = '%23D4AF37';
        if (formData.stoneType === 'Diamond') stoneColor = '%23E0F7FA';
        else if (formData.stoneType === 'Ruby') stoneColor = '%23FFCDD2';
        else if (formData.stoneType === 'Sapphire') stoneColor = '%23BBDEFB';
        
        const imageSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231a1a1a"/><circle cx="50" cy="50" r="30" fill="none" stroke="${goldColor}" stroke-width="4"/><circle cx="50" cy="20" r="10" fill="${stoneColor}" opacity="0.95"/></svg>`;

        await addProduct({
          ...formData,
          sku,
          image: formData.image || imageSvg,
          gallery: [formData.image || imageSvg]
        });
        success('Catalog Item Added', `${formData.name} added with auto-generated SKU: ${sku}`);
      }
      setFormOpen(false);
    } catch (err) {
      error('Operation Failed', 'Something went wrong saving the product details');
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to retire product ${name} from the catalog inventory?`)) {
      await deleteProduct(id);
      success('Product Retired', 'Product deleted from active registry.');
      if (viewId === id) {
        searchParams.delete('view');
        setSearchParams(searchParams);
      }
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.metal.toLowerCase().includes(q) ||
          p.stoneType.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Metal filter
    if (metalFilter) {
      result = result.filter((p) => p.metal === metalFilter);
    }

    // Stone filter
    if (stoneFilter) {
      result = result.filter((p) => p.stoneType === stoneFilter);
    }

    // Sort options
    if (sortBy === 'sku') {
      result.sort((a, b) => b.sku.localeCompare(a.sku)); // show newest first
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'weight') {
      result.sort((a, b) => b.weight - a.weight);
    }

    return result;
  }, [products, searchTerm, categoryFilter, metalFilter, stoneFilter, sortBy]);

  // Paginated chunk
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const isInvManager = user?.role === 'Inventory Manager';
  const isAdmin = user?.role === 'Administrator';
  const isProdManager = user?.role === 'Production Manager';

  const canEdit = isAdmin || isInvManager;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Product Vault Catalog</span>
            <Gem className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">
            Showcasing {filteredProducts.length} premium design assets
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => {
              const data = products.map(p => ({
                SKU: p.sku,
                Name: p.name,
                Category: p.category,
                Metal: p.metal,
                Purity: p.purity,
                Weight: p.weight,
                Stone: p.stoneType,
                Stock: p.stock,
                Price: p.sellingPrice
              }));
              exportToExcel(data, 'Product Catalog', 'product_catalog');
            }}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            Export Excel
          </button>
          <button
            onClick={() => {
              const headers = ['SKU', 'Name', 'Category', 'Metal', 'Purity', 'Weight', 'Stone', 'Stock', 'Price'];
              const rows = products.map(p => [
                p.sku, p.name, p.category, p.metal, p.purity,
                `${p.weight}g`, p.stoneType, `${p.stock}`, `$${p.sellingPrice.toLocaleString()}`
              ]);
              exportToPDF({ title: 'Auric Jewels - Product Catalog', headers, rows, fileName: 'product_catalog' });
            }}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            Export PDF
          </button>
          <button
            onClick={() => toggleBookmark('/products')}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-gold-400/10 border-gold-400/35 text-gold-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs shadow-md shadow-gold-500/10 hover:shadow-gold-500/25 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar row */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by SKU, gem, metal..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>

        {/* Dynamic Select Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Categories</option>
            <option value="Rings">Rings</option>
            <option value="Necklaces">Necklaces</option>
            <option value="Bracelets">Bracelets</option>
            <option value="Earrings">Earrings</option>
          </select>

          <select
            value={metalFilter}
            onChange={(e) => { setMetalFilter(e.target.value); setCurrentPage(1); }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Metals</option>
            <option value="Yellow Gold">Yellow Gold</option>
            <option value="White Gold">White Gold</option>
            <option value="Rose Gold">Rose Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Silver">Silver</option>
          </select>

          <select
            value={stoneFilter}
            onChange={(e) => { setStoneFilter(e.target.value); setCurrentPage(1); }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Stones</option>
            <option value="None">No Gemstone</option>
            <option value="Diamond">Diamond</option>
            <option value="Ruby">Ruby</option>
            <option value="Sapphire">Sapphire</option>
            <option value="Emerald">Emerald</option>
            <option value="Pearl">Pearl</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300 font-semibold"
          >
            <option value="sku">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="weight">Highest Weight</option>
          </select>
        </div>
      </div>

      {/* Product Catalog Grid list */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel py-20 text-center text-neutral-400 text-sm flex flex-col items-center justify-center gap-2">
          <Package className="w-12 h-12 text-gold-400/50" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">No Assets Found</h4>
          <span>Try clearing filters or check back later.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              className="glass-panel p-4 flex flex-col justify-between hover:border-gold-400/30 transition-all duration-300 group cursor-pointer"
              onClick={() => setSearchParams({ view: p.id })}
            >
              {/* Card Image Wrapper */}
              <div className="relative aspect-square rounded-xl bg-neutral-950/95 overflow-hidden flex items-center justify-center border border-neutral-200/10 mb-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Category tag bubble */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-900/90 text-[9px] font-semibold text-gold-400 tracking-wider font-poppins uppercase border border-gold-400/20">
                  {p.category}
                </span>

                {p.stock < 3 && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-950/90 text-[8px] font-bold text-rose-400 tracking-wider uppercase border border-rose-500/20">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-gold-400 transition-colors">
                      {p.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase">{p.sku}</span>
                    <span className="text-neutral-600 dark:text-neutral-500">•</span>
                    <span className="text-[9.5px] font-medium text-neutral-400">{p.metal} ({p.purity})</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div>
                    <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest leading-none">Price Est.</p>
                    <span className="text-sm font-bold font-poppins text-gold-500">${p.sellingPrice.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest leading-none">In Vault</p>
                    <span className={`text-xs font-bold font-mono ${p.stock < 5 ? 'text-rose-400' : 'text-neutral-900 dark:text-white'}`}>{p.stock} u</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
          <span className="text-neutral-400">
            Showing Page <span className="font-semibold text-neutral-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-neutral-900 dark:text-white">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: Add/Edit Product --------------------- */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProduct ? 'Configure Catalog Asset' : 'Record New Catalog Asset'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Col */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Master Solitaire Diamond Ring"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Earrings">Earrings</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Metal Base</label>
                  <select
                    value={formData.metal}
                    onChange={(e) => setFormData({ ...formData, metal: e.target.value as any })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Silver">Silver</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Purity</label>
                  <select
                    value={formData.purity}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value as any })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  >
                    <option value="24K">24K (Pure Gold)</option>
                    <option value="22K">22K (Standard)</option>
                    <option value="18K">18K (Luxury Bands)</option>
                    <option value="PT950">PT950 (Platinum)</option>
                    <option value="925">925 Sterling Silver</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Metal Weight (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Gemstone Accents</label>
                  <select
                    value={formData.stoneType}
                    onChange={(e) => setFormData({ ...formData, stoneType: e.target.value as any })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  >
                    <option value="None">None</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Sapphire">Sapphire</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Pearl">Pearl</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Gemstone Weight (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formData.stoneType === 'None'}
                    value={formData.stoneWeight}
                    onChange={(e) => setFormData({ ...formData, stoneWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Diamond Grading</label>
                  <input
                    type="text"
                    disabled={formData.stoneType !== 'Diamond'}
                    value={formData.diamondDetails}
                    onChange={(e) => setFormData({ ...formData, diamondDetails: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white disabled:opacity-40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Lab Cert Number</label>
                  <input
                    type="text"
                    disabled={formData.stoneType === 'None'}
                    value={formData.certificationNumber}
                    onChange={(e) => setFormData({ ...formData, certificationNumber: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-400">Making Charges ($/g)</label>
                  <input
                    type="number"
                    value={formData.makingCharges}
                    onChange={(e) => setFormData({ ...formData, makingCharges: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-gold-400 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Selling Price (Auto)</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gold-400/10 border border-gold-400/30 text-gold-400 rounded-xl py-2.5 px-3 outline-none focus:border-gold-400 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-neutral-400">Product Card Description</label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    className="text-[10px] text-gold-400 font-bold hover:text-gold-300 transition-colors flex items-center gap-1 font-poppins"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Description Writer</span>
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 transition-all text-neutral-900 dark:text-white"
                />
              </div>

              {/* Tag section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-400">Active Tags</span>
                  <button
                    type="button"
                    onClick={generateAITags}
                    className="text-[10px] text-gold-400 font-bold hover:text-gold-300 transition-colors flex items-center gap-1 font-poppins"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Tag Recommender</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  {formData.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 flex items-center gap-1 text-[10px]">
                      <span>{t}</span>
                      <X className="w-3 h-3 cursor-pointer text-neutral-500 hover:text-neutral-300" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) })} />
                    </span>
                  ))}
                  {formData.tags.length === 0 && <span className="text-neutral-500 text-[10px] italic">No active tags. Click AI Tag Recommender...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold shadow-md shadow-gold-500/10"
            >
              Authorize Save
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------- MODAL: Product Detail View Drawer --------------------- */}
      <Modal
        isOpen={!!viewProduct}
        onClose={() => setSearchParams({})}
        title={viewProduct ? `${viewProduct.name} - Registry Details` : 'Asset Details'}
        size="lg"
      >
        {viewProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-700 dark:text-neutral-300">
            {/* Image section */}
            <div className="space-y-4">
              <div className="aspect-square bg-neutral-950 rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-800">
                <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="glass-panel p-4 space-y-2 border-gold-400/10">
                <h5 className="font-semibold text-neutral-400 uppercase tracking-widest text-[9.5px]">Assigned Vault Location</h5>
                <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{viewProduct.location}</p>
                <div className="flex gap-2 pt-2 text-[10px] font-semibold">
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 flex-1">
                    <span className="text-neutral-500 block">Barcode ID</span>
                    <span className="font-mono text-neutral-800 dark:text-white">{viewProduct.sku}</span>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 flex-1">
                    <span className="text-neutral-500 block">QR Signature</span>
                    <span className="font-mono text-emerald-500">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* QR Code Tag */}
              <div className="glass-panel p-4 space-y-2 border-gold-400/10">
                <h5 className="font-semibold text-neutral-400 uppercase tracking-widest text-[9.5px]">Asset QR Tag</h5>
                <div className="flex items-center gap-4">
                  <QRCodeGenerator value={`AURIC-PRODUCT:${viewProduct.sku}|${viewProduct.name}|${viewProduct.metal}`} size={80} />
                  <div className="text-[10px] text-neutral-500 space-y-1">
                    <p>Scan to identify this asset</p>
                    <p className="font-mono text-neutral-400">{viewProduct.sku}</p>
                    <p className="text-[9px] text-neutral-400">Contains: SKU, Name, Metal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spec Sheet Column */}
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-gold-400/10 text-gold-400 border border-gold-400/25 uppercase font-bold text-[9px] tracking-wider">
                  {viewProduct.category}
                </span>
                <h3 className="text-xl font-bold font-poppins text-neutral-900 dark:text-white mt-2">
                  {viewProduct.name}
                </h3>
                <span className="text-xs font-mono text-neutral-500 font-semibold">{viewProduct.sku}</span>
              </div>

              {/* Price Tag Row */}
              <div className="p-4 rounded-xl bg-gold-400/10 border border-gold-400/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">Selling Price</span>
                  <p className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    ${viewProduct.sellingPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">In Vault Stock</span>
                  <span className={`text-base font-bold font-mono ${viewProduct.stock < 5 ? 'text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
                    {viewProduct.stock} units
                  </span>
                </div>
              </div>

              {/* Spec sheet table */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
                <div className="grid grid-cols-2 p-3">
                  <span className="font-semibold text-neutral-400">Metal & Purity</span>
                  <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">{viewProduct.metal} ({viewProduct.purity})</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="font-semibold text-neutral-400">Net Weight</span>
                  <span className="text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono">{viewProduct.weight}g</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="font-semibold text-neutral-400">Stone / Accent</span>
                  <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">{viewProduct.stoneType}</span>
                </div>
                {viewProduct.stoneType !== 'None' && (
                  <>
                    <div className="grid grid-cols-2 p-3">
                      <span className="font-semibold text-neutral-400">Stone Carats</span>
                      <span className="text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono">{viewProduct.stoneWeight} ct</span>
                    </div>
                    {viewProduct.stoneType === 'Diamond' && (
                      <div className="grid grid-cols-2 p-3">
                        <span className="font-semibold text-neutral-400">Clarity & Cut</span>
                        <span className="text-right font-medium text-neutral-800 dark:text-neutral-200 truncate">{viewProduct.diamondDetails}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 p-3">
                      <span className="font-semibold text-neutral-400">Grading Cert #</span>
                      <span className="text-right font-medium text-neutral-800 dark:text-neutral-200 font-mono">{viewProduct.certificationNumber}</span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 p-3">
                  <span className="font-semibold text-neutral-400">Making Charges</span>
                  <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">${viewProduct.makingCharges}/g</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="font-semibold text-neutral-400 uppercase tracking-widest text-[9.5px]">Description</h5>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">{viewProduct.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {viewProduct.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-[10px] font-semibold">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Actions row */}
              {canEdit && (
                <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => { setViewProduct(null); handleOpenEdit(viewProduct); }}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modify Record</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(viewProduct.id, viewProduct.name)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Retire Product</span>
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
