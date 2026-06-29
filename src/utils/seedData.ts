export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings' | 'Custom';
  metal: 'Yellow Gold' | 'White Gold' | 'Rose Gold' | 'Platinum' | 'Silver';
  purity: '18K' | '22K' | '24K' | 'PT950' | '925';
  weight: number; // in grams
  stoneType: 'Diamond' | 'Ruby' | 'Sapphire' | 'Emerald' | 'Pearl' | 'None';
  stoneWeight: number; // in carats
  diamondDetails: string;
  certificationNumber: string;
  makingCharges: number; // per gram
  sellingPrice: number;
  description: string;
  image: string;
  gallery: string[];
  tags: string[];
  stock: number;
  location: string;
}

export interface Customer {
  id: string;
  photo: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  birthday: string;
  anniversary: string;
  notes: string;
  favoriteProducts: string[]; // SKUs
  lifetimeValue: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  weight: number;
  price: number;
  customInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  deliveryStatus: 'Pending' | 'Casting' | 'Polishing' | 'Setting' | 'QC' | 'Ready' | 'Delivered' | 'Cancelled';
  notes: string;
  attachments: string[];
  isQuotation: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  weight: number;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  referenceId: string;
  performedBy: string;
  notes: string;
}

export interface ProductionNote {
  id: string;
  date: string;
  author: string;
  comment: string;
}

export interface ProductionJob {
  id: string;
  jobId: string;
  orderId?: string;
  orderNumber?: string;
  productId: string;
  productName: string;
  craftsman: string;
  stage: 'Casting' | 'Polishing' | 'Stone Setting' | 'Quality Check' | 'Packaging' | 'Completed';
  status: 'In Progress' | 'Delayed' | 'Completed' | 'On Hold';
  startedAt: string;
  expectedDate: string;
  actualDate?: string;
  delayIndicator: boolean;
  notes: ProductionNote[];
  progressBar: number;
}

// Procedural generator helpers
const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Rohan', 'Reyansh', 'Krishna', 'Ishaan', 'Kabir', 'Ananya', 'Diya', 'Ira', 'Kiara', 'Myra', 'Pari', 'Saanvi', 'Prisha', 'Aanya', 'Riya', 'Rahul', 'Neha', 'Pooja', 'Suresh', 'Amit', 'Rajesh', 'Sanjay', 'Vikram', 'Priya', 'Deepika', 'Kunal', 'Manish', 'Kiran', 'Nisha', 'Sunita', 'Gita', 'Harish', 'Vijay', 'Prem', 'Mohan'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Mehta', 'Joshi', 'Shah', 'Trivedi', 'Rao', 'Nair', 'Iyer', 'Singh', 'Reddy', 'Choudhury', 'Sen', 'Banerjee', 'Mishra', 'Pandey', 'Dubey', 'Saxena', 'Kapoor', 'Khanna', 'Malhotra', 'Soni', 'Jain', 'Bhasin', 'Deshmukh', 'Kulkarni', 'Bhat', 'Shetty', 'Pillai', 'Acharya', 'Menon', 'Grover', 'Bose'];
const craftsmanList = ['Master Rajesh Soni', 'Vikram Shah', 'Ankit Soni', 'Devendra Dewangan', 'Suresh Patwa', 'Ramesh Choksi', 'Harish Zaveri'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune', 'Surat', 'Jaipur'];

const categories: Array<'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings'> = ['Rings', 'Necklaces', 'Bracelets', 'Earrings'];
const metals = [
  { name: 'Yellow Gold', purities: ['22K', '24K', '18K'] },
  { name: 'White Gold', purities: ['18K'] },
  { name: 'Rose Gold', purities: ['18K'] },
  { name: 'Platinum', purities: ['PT950'] },
  { name: 'Silver', purities: ['925'] }
];

const gemstones = [
  { type: 'None', weightRange: [0, 0] },
  { type: 'Diamond', weightRange: [0.2, 5.0] },
  { type: 'Ruby', weightRange: [0.5, 8.0] },
  { type: 'Sapphire', weightRange: [0.5, 10.0] },
  { type: 'Emerald', weightRange: [0.5, 9.0] },
  { type: 'Pearl', weightRange: [1.0, 15.0] }
];

const jewelryStyles = {
  Rings: ['Solitaire', 'Halo Ring', 'Trilogy Band', 'Classic Wedding Band', 'Eternity Ring', 'Signet Ring', 'Filigree Ring', 'Cocktail Ring', 'Vintage Marquise', 'Twisted Pavé'],
  Necklaces: ['Bridal Choker', 'Tennis Necklace', 'Classic Pendant', 'Lariat Necklace', 'Layered Chain', 'Opera Pearl String', 'Teardrop Collar', 'Statement Bib', 'Guttapusalu Collar', 'Mango Mala'],
  Bracelets: ['Classic Tennis', 'Structured Cuff', 'Filigree Bangle', 'Interlocking Link', 'Charm Bracelet', 'Flexible Rope', 'Kada Bangle', 'Milgrain Line', 'Slider Bracelet', 'Mesh Bracelet'],
  Earrings: ['Classic Studs', 'Chandelier Drops', 'Huggie Hoops', 'Jhumka Drops', 'Threader Line', 'Halo Solitaires', 'Statement Ear Cuffs', 'Baroque Pearl Drops', 'Climbers', 'Teardrop Danglers']
};

const diamondClarity = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
const diamondColor = ['D', 'E', 'F', 'G', 'H', 'I'];
const diamondCut = ['Excellent', 'Very Good', 'Ideal'];

// Random helpers
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (num: number, size: number): string => {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

// Generate deterministic-looking random data based on seed index
export function generateSeedData() {
  const seedProducts: Product[] = [];
  const seedCustomers: Customer[] = [];
  const seedOrders: Order[] = [];
  const seedTransactions: InventoryTransaction[] = [];
  const seedJobs: ProductionJob[] = [];

  // 1. Generate 500 Products
  for (let i = 1; i <= 500; i++) {
    const category = categories[(i - 1) % categories.length];
    const styles = jewelryStyles[category];
    const style = styles[(i - 1) % styles.length];
    const metalConfig = metals[i % metals.length];
    const metal = metalConfig.name as any;
    const purity = metalConfig.purities[i % metalConfig.purities.length] as any;
    
    const stoneConfig = gemstones[i % gemstones.length];
    const stoneType = stoneConfig.type as any;
    const stoneWeight = stoneType === 'None' ? 0 : parseFloat(randomRange(stoneConfig.weightRange[0], stoneConfig.weightRange[1]).toFixed(2));
    
    let diamondDetails = 'N/A';
    if (stoneType === 'Diamond') {
      diamondDetails = `${randomChoice(diamondClarity)} Clarity, ${randomChoice(diamondColor)} Color, ${randomChoice(diamondCut)} Cut`;
    }

    const weight = parseFloat(randomRange(category === 'Necklaces' ? 15 : 3, category === 'Necklaces' ? 65 : 18).toFixed(2));
    const certNum = stoneType === 'None' ? 'N/A' : `${randomChoice(['GIA', 'IGI'])}-${randomInt(100000000, 999999999)}`;
    const makingCharges = randomInt(12, 35); // per gram
    
    // Calculate estimated luxury price
    let metalBasePrice = purity === '24K' ? 75 : purity === '22K' ? 69 : purity === '18K' ? 57 : purity === 'PT950' ? 45 : 1.2; // mock rate per gram
    let rawMetalCost = weight * metalBasePrice;
    let stoneCost = 0;
    if (stoneType === 'Diamond') stoneCost = stoneWeight * 1800; // $1800 per ct
    else if (stoneType !== 'None') stoneCost = stoneWeight * 150; // other gems

    const makingCost = weight * makingCharges;
    const rawCost = rawMetalCost + stoneCost + makingCost;
    const markupMultiplier = 1.35; // luxury markup
    const sellingPrice = Math.round(rawCost * markupMultiplier);

    const sku = `AUR-${category.slice(0, 2).toUpperCase()}-${purity}-${pad(i, 3)}`;
    const name = `${metal} ${stoneType !== 'None' ? stoneType + ' ' : ''}${style}`;
    
    const description = `This exquisite ${name} represents the pinnacle of artisanal craftsmanship. Featuring ${weight}g of certified premium ${metal} (${purity}), highlighted by ${stoneType !== 'None' ? `${stoneWeight} carats of brilliant ${stoneType}` : 'a polished sleek minimalist finish'}. Certificate number: ${certNum}. Perfect for high-profile events, luxury collections, or legacy bridal gifts.`;

    const tags = [category, metal, purity];
    if (stoneType !== 'None') tags.push(stoneType);
    if (weight > 20) tags.push('Statement');
    if (sellingPrice > 8000) tags.push('Premium');

    // Create luxury CSS gradients or generic SVGs dynamically as base64 images
    const goldColor = metal === 'Yellow Gold' ? '%23D4AF37' : metal === 'Rose Gold' ? '%23E0A996' : metal === 'Platinum' ? '%23E5E4E2' : metal === 'White Gold' ? '%23F0EFEB' : '%23C0C0C0';
    let stoneColor = '%23D4AF37';
    if (stoneType === 'Diamond') stoneColor = '%23E0F7FA';
    else if (stoneType === 'Ruby') stoneColor = '%23FFCDD2';
    else if (stoneType === 'Sapphire') stoneColor = '%23BBDEFB';
    else if (stoneType === 'Emerald') stoneColor = '%23C8E6C9';
    else if (stoneType === 'Pearl') stoneColor = '%23FFF9C4';

    const imageSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231a1a1a"/><circle cx="50" cy="50" r="30" fill="none" stroke="${goldColor}" stroke-width="4"/><circle cx="50" cy="20" r="10" fill="${stoneColor}" opacity="0.95"/></svg>`;

    seedProducts.push({
      id: `prod_${i}`,
      sku,
      name,
      category,
      metal,
      purity,
      weight,
      stoneType,
      stoneWeight,
      diamondDetails,
      certificationNumber: certNum,
      makingCharges,
      sellingPrice,
      description,
      image: imageSvg,
      gallery: [imageSvg],
      tags,
      stock: randomInt(1, 15),
      location: `Vault-${randomChoice(['A', 'B', 'C'])}-${randomInt(1, 12)}`
    });
  }

  // 2. Generate 100 Customers
  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[(i - 1) % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`;
    const phone = `+91 9${randomInt(10000000, 99999999)}`;
    const city = cities[i % cities.length];
    const address = `${randomInt(10, 250)}, Jewel Heights, Sector ${randomInt(1, 24)}, ${city}, India`;
    const gst = `27${randomChoice(['A','B','C'])}${randomChoice(['P','C'])}${randomChoice(['A','M'])}${randomInt(1000, 9999)}${randomChoice(['A','B'])}${randomInt(1, 9)}Z${randomInt(1,9)}`;
    
    // Dates helper
    const birthMonth = pad(randomInt(1, 12), 2);
    const birthDay = pad(randomInt(1, 28), 2);
    const birthday = `19${randomInt(65, 98)}-${birthMonth}-${birthDay}`;

    const annivMonth = pad(randomInt(1, 12), 2);
    const annivDay = pad(randomInt(1, 28), 2);
    const anniversary = Math.random() > 0.3 ? `20${randomInt(5, 23)}-${annivMonth}-${annivDay}` : 'N/A';

    const favSkus = [
      seedProducts[randomInt(0, 100)].sku,
      seedProducts[randomInt(101, 200)].sku,
      seedProducts[randomInt(201, 300)].sku
    ];

    const customerPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

    seedCustomers.push({
      id: `cust_${i}`,
      photo: customerPhoto,
      name,
      email,
      phone,
      address,
      gst,
      birthday,
      anniversary,
      notes: `VVIP client. Preferes ${randomChoice(['Yellow Gold', 'Rose Gold', 'Platinum'])}. Speaks highly of our casting finish. Should send personalized gifts on birthdays/anniversaries.`,
      favoriteProducts: favSkus,
      lifetimeValue: 0, // calculated from orders
      createdAt: `2025-01-${pad(randomInt(1, 28), 2)}`
    });
  }

  // 3. Generate 200 Orders
  const paymentStatuses: Array<'Paid' | 'Partial' | 'Unpaid'> = ['Paid', 'Paid', 'Paid', 'Partial', 'Unpaid'];
  const deliveryStatuses: Array<'Pending' | 'Casting' | 'Polishing' | 'Setting' | 'QC' | 'Ready' | 'Delivered' | 'Cancelled'> = 
    ['Delivered', 'Delivered', 'Delivered', 'Ready', 'QC', 'Setting', 'Polishing', 'Casting', 'Pending'];

  let orderCounter = 1001;
  const today = new Date();
  for (let i = 1; i <= 200; i++) {
    const customer = seedCustomers[i % seedCustomers.length];
    
    // Choose 1-3 random products
    const numItems = randomInt(1, 3);
    const orderItems: OrderItem[] = [];
    let totalVal = 0;
    
    for (let k = 0; k < numItems; k++) {
      const prod = seedProducts[randomInt(0, 499)];
      const qty = randomInt(1, 2);
      const price = prod.sellingPrice;
      orderItems.push({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        quantity: qty,
        weight: prod.weight,
        price,
        customInstructions: Math.random() > 0.7 ? `Please engrave letters "${customer.name.slice(0, 2).toUpperCase()}" on inner band.` : undefined
      });
      totalVal += price * qty;
    }

    // Set order date spreading backwards
    const dateOffsetDays = 200 - i; // spread over last 200 days
    const orderDateObj = new Date(today.getTime() - dateOffsetDays * 24 * 60 * 60 * 1000);
    const orderDate = orderDateObj.toISOString().split('T')[0];
    
    const expDeliveryObj = new Date(orderDateObj.getTime() + 14 * 24 * 60 * 60 * 1000);
    const expectedDelivery = expDeliveryObj.toISOString().split('T')[0];

    const delivStatus = i <= 150 ? 'Delivered' : randomChoice(deliveryStatuses);
    const payStatus = delivStatus === 'Delivered' ? 'Paid' : randomChoice(paymentStatuses);

    let actualDelivery;
    if (delivStatus === 'Delivered') {
      const actualDelivObj = new Date(orderDateObj.getTime() + randomInt(10, 16) * 24 * 60 * 60 * 1000);
      actualDelivery = actualDelivObj.toISOString().split('T')[0];
    }

    const ord = {
      id: `ord_${i}`,
      orderNumber: `ORD-${orderDate.slice(0, 4)}-${orderCounter++}`,
      customerId: customer.id,
      customerName: customer.name,
      items: orderItems,
      orderDate,
      expectedDelivery,
      actualDelivery,
      totalAmount: totalVal,
      paymentStatus: payStatus,
      deliveryStatus: delivStatus,
      notes: `Order created by ${randomChoice(['sales@auric.com', 'admin@auric.com'])}. Custom sizing requested is standard size.`,
      attachments: [],
      isQuotation: false
    };

    seedOrders.push(ord);

    // Update customer LTV
    if (payStatus !== 'Unpaid') {
      customer.lifetimeValue += totalVal;
    }
  }

  // 4. Generate 150 Inventory Transactions (historical + log updates)
  const transactionTypes: Array<'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'> = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];
  for (let i = 1; i <= 150; i++) {
    const prod = seedProducts[randomInt(0, 499)];
    const type = i <= 80 ? 'IN' : randomChoice(transactionTypes);
    const qty = randomInt(1, 10);
    const weight = parseFloat((prod.weight * qty).toFixed(2));
    
    const dateOffset = 180 - i;
    const txDate = new Date(today.getTime() - dateOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let sourceLocation = 'Vendor Vault';
    let destinationLocation = prod.location;
    
    if (type === 'OUT') {
      sourceLocation = prod.location;
      destinationLocation = 'Customer Shipment';
    } else if (type === 'TRANSFER') {
      sourceLocation = prod.location;
      destinationLocation = `Showroom-${randomChoice(['Rack A', 'Shelf B', 'Counter 3'])}`;
    } else if (type === 'ADJUSTMENT') {
      sourceLocation = prod.location;
      destinationLocation = prod.location;
    }

    seedTransactions.push({
      id: `tx_${i}`,
      productId: prod.id,
      sku: prod.sku,
      productName: prod.name,
      type,
      quantity: qty,
      weight,
      date: txDate,
      sourceLocation,
      destinationLocation,
      referenceId: type === 'OUT' ? `ORD-${txDate.slice(0, 4)}-${randomInt(1001, 1150)}` : `VEND-TX-${randomInt(4000, 9999)}`,
      performedBy: randomChoice(['inventory@auric.com', 'admin@auric.com']),
      notes: `${type} transaction of ${qty} items logged under vault safety protocols.`
    });
  }

  // 5. Generate 75 Production Jobs
  const stages: Array<'Casting' | 'Polishing' | 'Stone Setting' | 'Quality Check' | 'Packaging' | 'Completed'> = 
    ['Casting', 'Polishing', 'Stone Setting', 'Quality Check', 'Packaging', 'Completed'];

  let jobCounter = 101;
  // Pick active orders or custom items
  for (let i = 1; i <= 75; i++) {
    const order = seedOrders[200 - i]; // Pick the latest orders
    const item = order.items[0];
    const craftsman = craftsmanList[i % craftsmanList.length];
    
    const stage = i <= 35 ? 'Completed' : stages[i % stages.length];
    const status = stage === 'Completed' ? 'Completed' : (Math.random() > 0.8 ? 'Delayed' : 'In Progress');

    const startOffset = 30 - i;
    const startedAt = new Date(today.getTime() - startOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const expObj = new Date(new Date(startedAt).getTime() + 10 * 24 * 60 * 60 * 1000);
    const expectedDate = expObj.toISOString().split('T')[0];

    const actualDate = stage === 'Completed' ? expectedDate : undefined;
    const delayIndicator = status === 'Delayed';

    const progressBar = stage === 'Casting' ? 20 : stage === 'Polishing' ? 40 : stage === 'Stone Setting' ? 60 : stage === 'Quality Check' ? 80 : stage === 'Packaging' ? 90 : 100;

    seedJobs.push({
      id: `job_${i}`,
      jobId: `JOB-${jobCounter++}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      productId: item.productId,
      productName: item.name,
      craftsman,
      stage,
      status,
      startedAt,
      expectedDate,
      actualDate,
      delayIndicator,
      progressBar,
      notes: [
        {
          id: `note_${i}_1`,
          date: startedAt,
          author: 'production@auric.com',
          comment: `Job initialized. Raw materials allocated. Weight: ${item.weight}g.`
        },
        {
          id: `note_${i}_2`,
          date: expectedDate,
          author: craftsman,
          comment: stage === 'Completed' ? 'QC approved and packed.' : `Currently working on ${stage} stage.`
        }
      ]
    });
  }

  return {
    products: seedProducts,
    customers: seedCustomers,
    orders: seedOrders,
    transactions: seedTransactions,
    jobs: seedJobs
  };
}
