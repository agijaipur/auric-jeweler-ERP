import { create } from 'zustand';
import { dbInstance, AppSettings } from '../db/db';
import { Product, Customer, Order, InventoryTransaction, ProductionJob, ProductionNote } from '../utils/seedData';

// Cookie Helpers
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export interface UserSession {
  email: string;
  name: string;
  role: 'Administrator' | 'Inventory Manager' | 'Sales Executive' | 'Production Manager';
  avatar: string;
}

const DEFAULT_USERS: Record<string, UserSession & { passwordHash: string }> = {
  'admin@auric.com': {
    email: 'admin@auric.com',
    name: 'Aishwarya Roy',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    passwordHash: 'password123'
  },
  'inventory@auric.com': {
    email: 'inventory@auric.com',
    name: 'Rohan Mehta',
    role: 'Inventory Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    passwordHash: 'password123'
  },
  'sales@auric.com': {
    email: 'sales@auric.com',
    name: 'Vikram Joshi',
    role: 'Sales Executive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    passwordHash: 'password123'
  },
  'production@auric.com': {
    email: 'production@auric.com',
    name: 'Master Rajesh Soni',
    role: 'Production Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    passwordHash: 'password123'
  }
};

interface AuricState {
  // Auth
  user: UserSession | null;
  isAuthenticated: boolean;
  rememberedEmail: string;

  // Data
  products: Product[];
  customers: Customer[];
  orders: Order[];
  transactions: InventoryTransaction[];
  jobs: ProductionJob[];
  settings: AppSettings | null;

  // UI state
  isLoading: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;

  // Bookmarks & Favorites
  bookmarks: string[]; // paths
  favorites: string[]; // product SKUs

  // Actions
  initStore: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Bookmarks Actions
  toggleBookmark: (path: string) => void;
  toggleFavorite: (sku: string) => void;

  // Database CRUDs
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCustomer: (customer: Omit<Customer, 'id' | 'lifetimeValue' | 'createdAt'> & { id?: string }) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'totalAmount'> & { id?: string; orderNumber?: string }) => Promise<Order>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  addTransaction: (tx: Omit<InventoryTransaction, 'id' | 'date'>) => Promise<void>;
  
  addJob: (job: Omit<ProductionJob, 'id' | 'startedAt' | 'progressBar'> & { id?: string }) => Promise<void>;
  updateJob: (job: ProductionJob) => Promise<void>;
  addJobNote: (jobId: string, comment: string, author: string) => Promise<void>;

  updateSettings: (settings: AppSettings) => Promise<void>;
  resetApplication: () => Promise<void>;
}

export const useStore = create<AuricState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  rememberedEmail: localStorage.getItem('auric_remembered_email') || '',

  products: [],
  customers: [],
  orders: [],
  transactions: [],
  jobs: [],
  settings: null,

  isLoading: true,
  theme: (localStorage.getItem('auric_theme') as 'light' | 'dark') || 'dark',
  sidebarOpen: true,
  commandPaletteOpen: false,

  bookmarks: JSON.parse(localStorage.getItem('auric_bookmarks') || '[]'),
  favorites: JSON.parse(localStorage.getItem('auric_favorites') || '[]'),

  initStore: async () => {
    set({ isLoading: true });
    try {
      // Seed DB first (will only seed if empty)
      await dbInstance.seedDatabase();

      // Retrieve Data from IndexedDB
      const products = await dbInstance.getAll<Product>('products');
      const customers = await dbInstance.getAll<Customer>('customers');
      const orders = await dbInstance.getAll<Order>('orders');
      const transactions = await dbInstance.getAll<InventoryTransaction>('transactions');
      const jobs = await dbInstance.getAll<ProductionJob>('jobs');
      const settingsList = await dbInstance.getAll<any>('settings');
      
      const appSettings = settingsList.find(s => s.key === 'app_settings') || null;

      // Check Cookie Session
      const sessionCookie = getCookie('auric_session');
      let activeUser: UserSession | null = null;
      let isAuth = false;

      if (sessionCookie) {
        try {
          activeUser = JSON.parse(sessionCookie);
          isAuth = true;
        } catch (e) {
          deleteCookie('auric_session');
        }
      }

      set({
        products,
        customers,
        orders,
        transactions,
        jobs,
        settings: appSettings,
        user: activeUser,
        isAuthenticated: isAuth,
        isLoading: false
      });

      // Apply initial theme
      const currentTheme = get().theme;
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to initialize local ERP state:', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password, rememberMe) => {
    const userFound = DEFAULT_USERS[email.toLowerCase()];
    if (userFound && userFound.passwordHash === password) {
      const sessionData: UserSession = {
        email: userFound.email,
        name: userFound.name,
        role: userFound.role,
        avatar: userFound.avatar
      };

      // Set cookie session (7 days if remembered, session only otherwise)
      setCookie('auric_session', JSON.stringify(sessionData), rememberMe ? 7 : 1);
      
      if (rememberMe) {
        localStorage.setItem('auric_remembered_email', email);
        set({ rememberedEmail: email });
      } else {
        localStorage.removeItem('auric_remembered_email');
        set({ rememberedEmail: '' });
      }

      set({ user: sessionData, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    deleteCookie('auric_session');
    set({ user: null, isAuthenticated: false });
  },

  setTheme: (theme) => {
    localStorage.setItem('auric_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setCommandPaletteOpen: (open) => {
    set({ commandPaletteOpen: open });
  },

  toggleBookmark: (path) => {
    const current = get().bookmarks;
    let next;
    if (current.includes(path)) {
      next = current.filter(p => p !== path);
    } else {
      next = [...current, path];
    }
    localStorage.setItem('auric_bookmarks', JSON.stringify(next));
    set({ bookmarks: next });
  },

  toggleFavorite: (sku) => {
    const current = get().favorites;
    let next;
    if (current.includes(sku)) {
      next = current.filter(s => s !== sku);
    } else {
      next = [...current, sku];
    }
    localStorage.setItem('auric_favorites', JSON.stringify(next));
    set({ favorites: next });
  },

  // CRUD actions sync to IndexedDB and update Zustand State
  addProduct: async (newProduct) => {
    const id = newProduct.id || `prod_${Date.now()}`;
    const product: Product = {
      ...newProduct,
      id,
      stock: newProduct.stock || 0
    } as Product;

    await dbInstance.put('products', product);
    set(state => ({ products: [product, ...state.products] }));
    
    // Log auto transaction
    await get().addTransaction({
      productId: id,
      sku: product.sku,
      productName: product.name,
      type: 'IN',
      quantity: product.stock,
      weight: product.weight * product.stock,
      sourceLocation: 'Initial Stocking',
      destinationLocation: product.location,
      referenceId: 'AUTO-GEN-STOCK',
      performedBy: get().user?.email || 'system',
      notes: 'Auto-generated on product creation'
    });
  },

  updateProduct: async (product) => {
    await dbInstance.put('products', product);
    set(state => ({
      products: state.products.map(p => p.id === product.id ? product : p)
    }));
  },

  deleteProduct: async (id) => {
    await dbInstance.delete('products', id);
    set(state => ({
      products: state.products.filter(p => p.id !== id)
    }));
  },

  addCustomer: async (newCust) => {
    const id = newCust.id || `cust_${Date.now()}`;
    const customer: Customer = {
      ...newCust,
      id,
      lifetimeValue: 0,
      createdAt: new Date().toISOString().split('T')[0]
    } as Customer;

    await dbInstance.put('customers', customer);
    set(state => ({ customers: [customer, ...state.customers] }));
  },

  updateCustomer: async (customer) => {
    await dbInstance.put('customers', customer);
    set(state => ({
      customers: state.customers.map(c => c.id === customer.id ? customer : c)
    }));
  },

  deleteCustomer: async (id) => {
    await dbInstance.delete('customers', id);
    set(state => ({
      customers: state.customers.filter(c => c.id !== id)
    }));
  },

  addOrder: async (newOrder) => {
    const id = newOrder.id || `ord_${Date.now()}`;
    const year = new Date().getFullYear();
    const activeOrders = get().orders;
    const orderNumber = newOrder.orderNumber || `ORD-${year}-${activeOrders.length + 1001}`;
    
    // Calculate total
    const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order: Order = {
      ...newOrder,
      id,
      orderNumber,
      totalAmount,
    } as Order;

    await dbInstance.put('orders', order);
    
    // Update store
    set(state => ({ orders: [order, ...state.orders] }));

    // Adjust LTV of Customer
    if (order.paymentStatus !== 'Unpaid') {
      const customer = get().customers.find(c => c.id === order.customerId);
      if (customer) {
        const updated = {
          ...customer,
          lifetimeValue: customer.lifetimeValue + totalAmount
        };
        await get().updateCustomer(updated);
      }
    }

    // Adjust inventory stock levels and create transactions
    for (const item of order.items) {
      const prod = get().products.find(p => p.id === item.productId || p.sku === item.sku);
      if (prod) {
        const updatedProd = {
          ...prod,
          stock: Math.max(0, prod.stock - item.quantity)
        };
        await get().updateProduct(updatedProd);

        // Add inventory log
        await get().addTransaction({
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          type: 'OUT',
          quantity: item.quantity,
          weight: item.weight * item.quantity,
          sourceLocation: prod.location,
          destinationLocation: 'Customer Order',
          referenceId: orderNumber,
          performedBy: get().user?.email || 'sales@auric.com',
          notes: 'Auto-deducted on order placement'
        });
      }
    }

    // Auto-create Production Job if status is casting/polishing/pending
    if (order.deliveryStatus !== 'Delivered' && order.deliveryStatus !== 'Cancelled' && order.deliveryStatus !== 'Ready') {
      await get().addJob({
        jobId: `JOB-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: order.items[0].productId,
        productName: order.items[0].name,
        craftsman: 'Master Rajesh Soni', // default allocation
        stage: 'Casting',
        status: 'In Progress',
        expectedDate: order.expectedDelivery,
        delayIndicator: false,
        notes: [
          {
            id: `note_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            author: 'system',
            comment: `Production job auto-generated from order ${orderNumber}. Allocated to Master Rajesh Soni.`
          }
        ]
      });
    }

    return order;
  },

  updateOrder: async (order) => {
    // Check if delivery status updated to Delivered, adjust actualDelivery date
    const prevOrder = get().orders.find(o => o.id === order.id);
    let updatedOrder = { ...order };
    
    if (order.deliveryStatus === 'Delivered' && prevOrder?.deliveryStatus !== 'Delivered') {
      updatedOrder.actualDelivery = new Date().toISOString().split('T')[0];
      updatedOrder.paymentStatus = 'Paid'; // assume paid on final hand-delivery
    }

    await dbInstance.put('orders', updatedOrder);
    set(state => ({
      orders: state.orders.map(o => o.id === order.id ? updatedOrder : o)
    }));

    // Update customer LTV if payment status transitions to Paid
    if (updatedOrder.paymentStatus === 'Paid' && prevOrder?.paymentStatus === 'Unpaid') {
      const customer = get().customers.find(c => c.id === order.customerId);
      if (customer) {
        const updated = {
          ...customer,
          lifetimeValue: customer.lifetimeValue + order.totalAmount
        };
        await get().updateCustomer(updated);
      }
    }
  },

  deleteOrder: async (id) => {
    await dbInstance.delete('orders', id);
    set(state => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
  },

  addTransaction: async (txData) => {
    const id = `tx_${Date.now()}`;
    const transaction: InventoryTransaction = {
      ...txData,
      id,
      date: new Date().toISOString().split('T')[0]
    };

    await dbInstance.put('transactions', transaction);
    set(state => ({ transactions: [transaction, ...state.transactions] }));
  },

  addJob: async (newJob) => {
    const id = newJob.id || `job_${Date.now()}`;
    const jobId = `JOB-${get().jobs.length + 101}`;
    
    const job: ProductionJob = {
      ...newJob,
      id,
      jobId,
      startedAt: new Date().toISOString().split('T')[0],
      progressBar: 15
    } as ProductionJob;

    await dbInstance.put('jobs', job);
    set(state => ({ jobs: [job, ...state.jobs] }));
  },

  updateJob: async (job) => {
    // Auto-calculate progress bar from stage
    const stageProgress = {
      'Casting': 20,
      'Polishing': 40,
      'Stone Setting': 60,
      'Quality Check': 80,
      'Packaging': 90,
      'Completed': 100
    };
    
    const updatedJob: ProductionJob = {
      ...job,
      progressBar: stageProgress[job.stage] || 0,
      status: job.stage === 'Completed' ? 'Completed' : job.status,
      actualDate: job.stage === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    };

    await dbInstance.put('jobs', updatedJob);
    set(state => ({
      jobs: state.jobs.map(j => j.id === job.id ? updatedJob : j)
    }));

    // If completed, sync back to order delivery status -> Ready
    if (job.stage === 'Completed' && job.orderId) {
      const order = get().orders.find(o => o.id === job.orderId);
      if (order && order.deliveryStatus !== 'Delivered') {
        const updatedOrder = {
          ...order,
          deliveryStatus: 'Ready' as const
        };
        await get().updateOrder(updatedOrder);
      }
    }
  },

  addJobNote: async (jobId, comment, author) => {
    const job = get().jobs.find(j => j.id === jobId);
    if (!job) return;

    const newNote: ProductionNote = {
      id: `note_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author,
      comment
    };

    const updatedJob = {
      ...job,
      notes: [...job.notes, newNote]
    };

    await dbInstance.put('jobs', updatedJob);
    set(state => ({
      jobs: state.jobs.map(j => j.id === jobId ? updatedJob : j)
    }));
  },

  updateSettings: async (settings) => {
    await dbInstance.put('settings', { key: 'app_settings', ...settings });
    set({ settings });
  },

  resetApplication: async () => {
    set({ isLoading: true });
    await dbInstance.seedDatabase(true); // force re-seed
    
    // reload all state
    const products = await dbInstance.getAll<Product>('products');
    const customers = await dbInstance.getAll<Customer>('customers');
    const orders = await dbInstance.getAll<Order>('orders');
    const transactions = await dbInstance.getAll<InventoryTransaction>('transactions');
    const jobs = await dbInstance.getAll<ProductionJob>('jobs');
    const settingsList = await dbInstance.getAll<any>('settings');
    const appSettings = settingsList.find(s => s.key === 'app_settings') || null;

    localStorage.removeItem('auric_bookmarks');
    localStorage.removeItem('auric_favorites');

    set({
      products,
      customers,
      orders,
      transactions,
      jobs,
      settings: appSettings,
      bookmarks: [],
      favorites: [],
      isLoading: false
    });
  }
}));
