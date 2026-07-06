import { create } from 'zustand';
import { dbInstance, AppSettings } from '../db/db';
import { 
  Product, 
  Customer, 
  Order, 
  InventoryTransaction, 
  ProductionJob, 
  ProductionNote,
  Supplier,
  PurchaseOrder,
  AppNotification,
  ActivityLog,
  WorkflowRule
} from '../utils/seedData';

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
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  workflowRules: WorkflowRule[];

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

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Purchase Order Actions
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'totalCost'> & { id?: string; poNumber?: string }) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  receivePurchaseOrder: (id: string, receivedQtys: { productId: string; qty: number }[]) => Promise<void>;
  verifyPurchaseOrder: (id: string, verifiedQtys: { productId: string; qty: number }[]) => Promise<void>;

  // Notification Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Activity Log Actions
  logActivity: (action: ActivityLog['action'], entity: ActivityLog['entity'], entityId: string, entityName: string, description: string, metadata?: Record<string, any>) => Promise<void>;

  // Workflow Automation Actions
  addWorkflowRule: (rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'triggerCount'>) => Promise<void>;
  updateWorkflowRule: (rule: WorkflowRule) => Promise<void>;
  deleteWorkflowRule: (id: string) => Promise<void>;
  executeWorkflows: (trigger: WorkflowRule['trigger'], data: any) => Promise<void>;

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
  suppliers: [],
  purchaseOrders: [],
  notifications: [],
  activityLogs: [],
  workflowRules: [],

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
      const suppliers = await dbInstance.getAll<Supplier>('suppliers');
      const purchaseOrders = await dbInstance.getAll<PurchaseOrder>('purchaseOrders');
      const notifications = await dbInstance.getAll<AppNotification>('notifications');
      const activityLogs = await dbInstance.getAll<ActivityLog>('activityLogs');
      const workflowRules = await dbInstance.getAll<WorkflowRule>('workflowRules');
      
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
        suppliers,
        purchaseOrders,
        notifications,
        activityLogs,
        workflowRules,
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

    await get().logActivity('CREATE', 'product', id, product.name, `Product ${product.name} (${product.sku}) created.`);
    await get().executeWorkflows('low_stock', product);
  },

  updateProduct: async (product) => {
    await dbInstance.put('products', product);
    set(state => ({
      products: state.products.map(p => p.id === product.id ? product : p)
    }));
    await get().logActivity('UPDATE', 'product', product.id, product.name, `Product ${product.name} (${product.sku}) updated.`);
    await get().executeWorkflows('low_stock', product);
  },

  deleteProduct: async (id) => {
    const prod = get().products.find(p => p.id === id);
    if (!prod) return;
    await dbInstance.delete('products', id);
    set(state => ({
      products: state.products.filter(p => p.id !== id)
    }));
    await get().logActivity('DELETE', 'product', id, prod.name, `Product ${prod.name} (${prod.sku}) deleted.`);
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
    await get().logActivity('CREATE', 'customer', id, customer.name, `Customer ${customer.name} registered.`);
  },

  updateCustomer: async (customer) => {
    await dbInstance.put('customers', customer);
    set(state => ({
      customers: state.customers.map(c => c.id === customer.id ? customer : c)
    }));
    await get().logActivity('UPDATE', 'customer', customer.id, customer.name, `Customer ${customer.name} profile updated.`);
  },

  deleteCustomer: async (id) => {
    const cust = get().customers.find(c => c.id === id);
    if (!cust) return;
    await dbInstance.delete('customers', id);
    set(state => ({
      customers: state.customers.filter(c => c.id !== id)
    }));
    await get().logActivity('DELETE', 'customer', id, cust.name, `Customer ${cust.name} deleted.`);
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

    await get().logActivity('CREATE', 'order', id, orderNumber, `Order ${orderNumber} booked.`);

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

    await get().logActivity('UPDATE', 'order', order.id, order.orderNumber, `Order ${order.orderNumber} updated.`);

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
    const ord = get().orders.find(o => o.id === id);
    if (!ord) return;
    await dbInstance.delete('orders', id);
    set(state => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
    await get().logActivity('DELETE', 'order', id, ord.orderNumber, `Order ${ord.orderNumber} deleted.`);
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
    await get().logActivity('CREATE', 'production', id, jobId, `Production Job ${jobId} initiated for order ${job.orderNumber || 'Custom'}.`);
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

    await get().logActivity('UPDATE', 'production', job.id, job.jobId, `Production Job ${job.jobId} updated. Stage: ${job.stage}.`);
    
    if (job.status === 'Delayed') {
      await get().executeWorkflows('production_delayed', updatedJob);
    }

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

  // Supplier Actions
  addSupplier: async (supplierData) => {
    const id = supplierData.id || `supp_${Date.now()}`;
    const supplier: Supplier = {
      ...supplierData,
      id,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await dbInstance.put('suppliers', supplier);
    set(state => ({ suppliers: [supplier, ...state.suppliers] }));
    await get().logActivity('CREATE', 'supplier', id, supplier.name, `Supplier ${supplier.name} registered.`);
  },

  updateSupplier: async (supplier) => {
    await dbInstance.put('suppliers', supplier);
    set(state => ({
      suppliers: state.suppliers.map(s => s.id === supplier.id ? supplier : s)
    }));
    await get().logActivity('UPDATE', 'supplier', supplier.id, supplier.name, `Supplier ${supplier.name} updated.`);
  },

  deleteSupplier: async (id) => {
    const supp = get().suppliers.find(s => s.id === id);
    if (!supp) return;
    await dbInstance.delete('suppliers', id);
    set(state => ({
      suppliers: state.suppliers.filter(s => s.id !== id)
    }));
    await get().logActivity('DELETE', 'supplier', id, supp.name, `Supplier ${supp.name} deleted.`);
  },

  // Purchase Order Actions
  addPurchaseOrder: async (poData) => {
    const id = poData.id || `po_${Date.now()}`;
    const poNumber = poData.poNumber || `PO-2026-${get().purchaseOrders.length + 1001}`;
    const totalCost = poData.items.reduce((sum, item) => sum + (item.unitCost * item.orderedQty), 0);

    const po: PurchaseOrder = {
      ...poData,
      id,
      poNumber,
      totalCost,
      status: poData.status || 'Draft'
    } as PurchaseOrder;

    await dbInstance.put('purchaseOrders', po);
    set(state => ({ purchaseOrders: [po, ...state.purchaseOrders] }));
    await get().logActivity('CREATE', 'purchase_order', id, poNumber, `Purchase Order ${poNumber} created.`);
    
    // Check if low stock rule triggered to update count
    if (poData.status === 'Sent') {
      await get().executeWorkflows('po_received', po);
    }
    return po;
  },

  updatePurchaseOrder: async (po) => {
    await dbInstance.put('purchaseOrders', po);
    set(state => ({
      purchaseOrders: state.purchaseOrders.map(p => p.id === po.id ? po : p)
    }));
    await get().logActivity('UPDATE', 'purchase_order', po.id, po.poNumber, `Purchase Order ${po.poNumber} updated.`);
  },

  deletePurchaseOrder: async (id) => {
    const po = get().purchaseOrders.find(p => p.id === id);
    if (!po) return;
    await dbInstance.delete('purchaseOrders', id);
    set(state => ({
      purchaseOrders: state.purchaseOrders.filter(p => p.id !== id)
    }));
    await get().logActivity('DELETE', 'purchase_order', id, po.poNumber, `Purchase Order ${po.poNumber} deleted.`);
  },

  receivePurchaseOrder: async (id, receivedQtys) => {
    const po = get().purchaseOrders.find(p => p.id === id);
    if (!po) return;

    const updatedItems = po.items.map(item => {
      const match = receivedQtys.find(r => r.productId === item.productId);
      return {
        ...item,
        receivedQty: match ? match.qty : item.receivedQty
      };
    });

    const updatedPo: PurchaseOrder = {
      ...po,
      items: updatedItems,
      status: 'Pending Verification',
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: get().user?.email || 'inventory@auric.com'
    };

    await dbInstance.put('purchaseOrders', updatedPo);
    set(state => ({
      purchaseOrders: state.purchaseOrders.map(p => p.id === id ? updatedPo : p)
    }));

    await get().logActivity('UPDATE', 'purchase_order', id, po.poNumber, `PO ${po.poNumber} marked as Received (Pending Verification).`);

    // Create Notification for admin/verifier
    await get().addNotification({
      type: 'po_received',
      title: 'PO Received - Verification Needed',
      message: `Purchase Order ${po.poNumber} has been received. Quantities require physical verification.`,
      severity: 'warning',
      actionUrl: `/purchase-orders?verify=${id}`,
      targetRoles: ['Administrator', 'Inventory Manager']
    });

    // Execute Workflows
    await get().executeWorkflows('po_received', updatedPo);
  },

  verifyPurchaseOrder: async (id, verifiedQtys) => {
    const po = get().purchaseOrders.find(p => p.id === id);
    if (!po) return;

    const updatedItems = po.items.map(item => {
      const match = verifiedQtys.find(v => v.productId === item.productId);
      return {
        ...item,
        verifiedQty: match ? match.qty : item.verifiedQty
      };
    });

    const verifiedDate = new Date().toISOString().split('T')[0];
    const verifiedBy = get().user?.email || 'admin@auric.com';

    const updatedPo: PurchaseOrder = {
      ...po,
      items: updatedItems,
      status: 'Completed',
      verifiedDate,
      verifiedBy
    };

    // Update Purchase Order record
    await dbInstance.put('purchaseOrders', updatedPo);

    // CRITICAL: Automatically update inventory and write transactions NOW
    for (const item of updatedItems) {
      const product = get().products.find(p => p.id === item.productId);
      if (product) {
        const nextStock = product.stock + item.verifiedQty;
        const updatedProduct = {
          ...product,
          stock: nextStock
        };

        // Update product stock
        await dbInstance.put('products', updatedProduct);
        set(state => ({
          products: state.products.map(p => p.id === product.id ? updatedProduct : p)
        }));

        // Write inventory log transaction
        await get().addTransaction({
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          type: 'IN',
          quantity: item.verifiedQty,
          weight: product.weight * item.verifiedQty,
          sourceLocation: 'Supplier Shipment',
          destinationLocation: product.location,
          referenceId: po.poNumber,
          performedBy: verifiedBy,
          notes: `Stock updated after PO physical verification.`
        });
      }
    }

    set(state => ({
      purchaseOrders: state.purchaseOrders.map(p => p.id === id ? updatedPo : p)
    }));

    await get().logActivity('VERIFY', 'purchase_order', id, po.poNumber, `PO ${po.poNumber} verified and stock updated.`);

    // Notification
    await get().addNotification({
      type: 'po_verified',
      title: 'PO Verification Completed',
      message: `PO ${po.poNumber} verified. Inventory updated accordingly.`,
      severity: 'success',
      actionUrl: `/purchase-orders?view=${id}`,
      targetRoles: ['Administrator', 'Inventory Manager', 'Sales Executive']
    });
  },

  // Notification Actions
  addNotification: async (notifData) => {
    const id = `notif_${Date.now()}`;
    const notification: AppNotification = {
      ...notifData,
      id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await dbInstance.put('notifications', notification);
    set(state => ({ notifications: [notification, ...state.notifications] }));
  },

  markNotificationRead: async (id) => {
    const notif = get().notifications.find(n => n.id === id);
    if (!notif) return;
    const updated = { ...notif, isRead: true };
    await dbInstance.put('notifications', updated);
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? updated : n)
    }));
  },

  markAllNotificationsRead: async () => {
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    await dbInstance.bulkPut('notifications', updated);
    set({ notifications: updated });
  },

  deleteNotification: async (id) => {
    await dbInstance.delete('notifications', id);
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  // Activity Log Actions
  logActivity: async (action, entity, entityId, entityName, description, metadata) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const log: ActivityLog = {
      id,
      action,
      entity,
      entityId,
      entityName,
      description,
      performedBy: get().user?.email || 'system',
      performedByRole: get().user?.role || 'system',
      timestamp: new Date().toISOString(),
      metadata
    };
    await dbInstance.put('activityLogs', log);
    set(state => ({ activityLogs: [log, ...state.activityLogs] }));
  },

  // Workflow Actions
  addWorkflowRule: async (ruleData) => {
    const id = `rule_${Date.now()}`;
    const rule: WorkflowRule = {
      ...ruleData,
      id,
      triggerCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await dbInstance.put('workflowRules', rule);
    set(state => ({ workflowRules: [rule, ...state.workflowRules] }));
    await get().logActivity('CREATE', 'settings', id, rule.name, `Workflow rule ${rule.name} created.`);
  },

  updateWorkflowRule: async (rule) => {
    await dbInstance.put('workflowRules', rule);
    set(state => ({
      workflowRules: state.workflowRules.map(r => r.id === rule.id ? rule : r)
    }));
    await get().logActivity('UPDATE', 'settings', rule.id, rule.name, `Workflow rule ${rule.name} updated.`);
  },

  deleteWorkflowRule: async (id) => {
    const rule = get().workflowRules.find(r => r.id === id);
    if (!rule) return;
    await dbInstance.delete('workflowRules', id);
    set(state => ({
      workflowRules: state.workflowRules.filter(r => r.id !== id)
    }));
    await get().logActivity('DELETE', 'settings', id, rule.name, `Workflow rule ${rule.name} deleted.`);
  },

  executeWorkflows: async (trigger, data) => {
    const rules = get().workflowRules.filter(r => r.isEnabled && r.trigger === trigger);
    
    for (const rule of rules) {
      let isTriggered = false;

      // Evaluate conditions
      if (trigger === 'low_stock') {
        const threshold = rule.conditions.threshold || 5;
        if (data.stock < threshold) {
          isTriggered = true;
        }
      } else if (trigger === 'po_received') {
        // e.g. PO is pending verification
        if (data.status === 'Pending Verification') {
          isTriggered = true;
        }
      } else if (trigger === 'production_delayed') {
        if (data.status === 'Delayed') {
          isTriggered = true;
        }
      }

      if (isTriggered) {
        // Trigger actions
        for (const action of rule.actions) {
          if (action.type === 'send_notification') {
            const config = action.config;
            let message = config.message || '';
            
            // Format variables
            if (data.name) message = message.replace('{{name}}', data.name);
            if (data.stock !== undefined) message = message.replace('{{stock}}', String(data.stock));
            if (data.poNumber) message = message.replace('{{poNumber}}', data.poNumber);
            if (data.supplierName) message = message.replace('{{supplierName}}', data.supplierName);
            if (data.productName) message = message.replace('{{productName}}', data.productName);
            if (data.jobId) message = message.replace('{{jobId}}', data.jobId);
            if (data.stage) message = message.replace('{{stage}}', data.stage);

            await get().addNotification({
              type: 'workflow',
              title: config.title || 'Workflow Triggered',
              message,
              severity: config.severity || 'info',
              targetRoles: config.targetRoles || ['Administrator']
            });
          } else if (action.type === 'create_purchase_order') {
            // Auto draft PO creation
            const config = action.config;
            const supplierId = config.defaultSupplierId || 'supp_1';
            const supplier = get().suppliers.find(s => s.id === supplierId);
            if (supplier) {
              await get().addPurchaseOrder({
                supplierId: supplier.id,
                supplierName: supplier.name,
                status: 'Draft',
                items: [{
                  productId: data.id,
                  sku: data.sku,
                  name: data.name,
                  orderedQty: config.reorderQty || 10,
                  receivedQty: 0,
                  verifiedQty: 0,
                  unitCost: Math.round(data.sellingPrice * 0.7),
                  weight: data.weight
                }],
                orderDate: new Date().toISOString().split('T')[0],
                expectedDelivery: new Date(Date.now() + supplier.leadTimeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: `Auto-generated draft PO due to low stock of ${data.name}.`,
                createdBy: 'system'
              });
            }
          }
        }

        // Update trigger counts
        const updatedRule = {
          ...rule,
          triggerCount: rule.triggerCount + 1,
          lastTriggered: new Date().toISOString().split('T')[0]
        };
        await dbInstance.put('workflowRules', updatedRule);
        set(state => ({
          workflowRules: state.workflowRules.map(r => r.id === rule.id ? updatedRule : r)
        }));

        await get().logActivity('WORKFLOW', 'settings', rule.id, rule.name, `Workflow rule "${rule.name}" triggered.`);
      }
    }
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
    const suppliers = await dbInstance.getAll<Supplier>('suppliers');
    const purchaseOrders = await dbInstance.getAll<PurchaseOrder>('purchaseOrders');
    const notifications = await dbInstance.getAll<AppNotification>('notifications');
    const activityLogs = await dbInstance.getAll<ActivityLog>('activityLogs');
    const workflowRules = await dbInstance.getAll<WorkflowRule>('workflowRules');
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
      suppliers,
      purchaseOrders,
      notifications,
      activityLogs,
      workflowRules,
      bookmarks: [],
      favorites: [],
      isLoading: false
    });
  }
}));
