import { generateSeedData, Product, Customer, Order, InventoryTransaction, ProductionJob } from '../utils/seedData';

const DB_NAME = 'AuricJewelsERP_DB';
const DB_VERSION = 1;

export interface AppSettings {
  companyName: string;
  companyLogo: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  orderPrefix: string;
  theme: 'light' | 'dark' | 'system';
  goldRate24K: number;
  goldRate22K: number;
  goldRate18K: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Auric Jewels Ltd.',
  companyLogo: '',
  currency: '$',
  taxRate: 3, // 3% GST on jewellery is standard in India
  invoicePrefix: 'INV',
  orderPrefix: 'ORD',
  theme: 'dark',
  goldRate24K: 75.50,
  goldRate22K: 69.20,
  goldRate18K: 57.10
};

export class AuricDB {
  private db: IDBDatabase | null = null;

  public init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event);
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create Object Stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('jobs')) {
          db.createObjectStore('jobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Generic Operations
  private getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return this.init().then((db) => {
      const transaction = db.transaction(storeName, mode);
      return transaction.objectStore(storeName);
    });
  }

  public getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readonly')
        .then((store) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  public get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readonly')
        .then((store) => {
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result as T | undefined);
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  public put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite')
        .then((store) => {
          const request = store.put(data);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  public delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite')
        .then((store) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  public bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.init()
        .then((db) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);

          items.forEach((item) => {
            store.put(item);
          });
        })
        .catch(reject);
    });
  }

  public clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite')
        .then((store) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  // Seeding functionality
  public async seedDatabase(force = false): Promise<void> {
    await this.init();
    
    const existingProducts = await this.getAll<Product>('products');
    if (existingProducts.length > 0 && !force) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding IndexedDB database...');

    // Clear first to prevent duplicate entries
    await this.clear('products');
    await this.clear('customers');
    await this.clear('orders');
    await this.clear('transactions');
    await this.clear('jobs');
    await this.clear('settings');

    const seed = generateSeedData();

    await this.bulkPut('products', seed.products);
    await this.bulkPut('customers', seed.customers);
    await this.bulkPut('orders', seed.orders);
    await this.bulkPut('transactions', seed.transactions);
    await this.bulkPut('jobs', seed.jobs);
    
    // Seed settings
    await this.put('settings', { key: 'app_settings', ...DEFAULT_SETTINGS });

    console.log('IndexedDB seed complete.');
  }

  // Backup & Import
  public async exportAllData(): Promise<string> {
    const products = await this.getAll<Product>('products');
    const customers = await this.getAll<Customer>('customers');
    const orders = await this.getAll<Order>('orders');
    const transactions = await this.getAll<InventoryTransaction>('transactions');
    const jobs = await this.getAll<ProductionJob>('jobs');
    const settings = await this.getAll<any>('settings');

    const exportObject = {
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      products,
      customers,
      orders,
      transactions,
      jobs,
      settings
    };

    return JSON.stringify(exportObject, null, 2);
  }

  public async importAllData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !data.customers || !data.orders || !data.transactions || !data.jobs) {
        throw new Error('Invalid JSON format: missing required stores');
      }

      await this.clear('products');
      await this.clear('customers');
      await this.clear('orders');
      await this.clear('transactions');
      await this.clear('jobs');
      if (data.settings) {
        await this.clear('settings');
      }

      await this.bulkPut('products', data.products);
      await this.bulkPut('customers', data.customers);
      await this.bulkPut('orders', data.orders);
      await this.bulkPut('transactions', data.transactions);
      await this.bulkPut('jobs', data.jobs);
      
      if (data.settings && data.settings.length > 0) {
        await this.bulkPut('settings', data.settings);
      } else {
        await this.put('settings', { key: 'app_settings', ...DEFAULT_SETTINGS });
      }

      console.log('Import successful.');
    } catch (e) {
      console.error('Import failed:', e);
      throw e;
    }
  }
}

export const dbInstance = new AuricDB();
