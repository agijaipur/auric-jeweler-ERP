import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Product, Order, ProductionJob, Supplier, PurchaseOrder } from './seedData';

// Extend jsPDF type to include autoTable method dynamically
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// Excel export
export function exportToExcel(data: any[], sheetName: string, fileName: string): void {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// PDF export options interface
export interface PDFExportOptions {
  title: string;
  headers: string[];
  rows: any[][];
  fileName: string;
  orientation?: 'portrait' | 'landscape';
}

// PDF export using jspdf + jspdf-autotable
export function exportToPDF(options: PDFExportOptions): void {
  const doc = new jsPDF(options.orientation || 'portrait') as jsPDFWithAutoTable;
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55); // Gold color
  doc.text(options.title, doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, 22, { align: 'center' });
  
  // Table
  doc.autoTable({
    head: [options.headers],
    body: options.rows,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [212, 175, 55] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 30 }
  });
  
  doc.save(`${options.fileName}.pdf`);
}

// Pre-built report generators
export function generateSalesReportExcel(orders: Order[]): void {
  const data = orders.map(o => ({
    'Order Number': o.orderNumber,
    'Customer Name': o.customerName,
    'Order Date': o.orderDate,
    'Expected Delivery': o.expectedDelivery,
    'Actual Delivery': o.actualDelivery || 'N/A',
    'Payment Status': o.paymentStatus,
    'Delivery Status': o.deliveryStatus,
    'Total Amount ($)': o.totalAmount
  }));
  exportToExcel(data, 'Sales Ledger', `sales_report_${Date.now()}`);
}

export function generateSalesReportPDF(orders: Order[]): void {
  const headers = ['Order #', 'Customer', 'Date', 'Delivery', 'Payment', 'Total'];
  const rows = orders.map(o => [
    o.orderNumber,
    o.customerName,
    o.orderDate,
    o.deliveryStatus,
    o.paymentStatus,
    `$${o.totalAmount.toLocaleString()}`
  ]);
  exportToPDF({
    title: 'Auric Jewels - Sales Revenue Report',
    headers,
    rows,
    fileName: `sales_report_${Date.now()}`
  });
}

export function generateInventoryReportExcel(products: Product[]): void {
  const data = products.map(p => ({
    'SKU': p.sku,
    'Name': p.name,
    'Category': p.category,
    'Metal': p.metal,
    'Purity': p.purity,
    'Weight (g)': p.weight,
    'Location': p.location,
    'Stock (units)': p.stock,
    'Selling Price ($)': p.sellingPrice,
    'Total Valuation ($)': p.sellingPrice * p.stock
  }));
  exportToExcel(data, 'Inventory Audit', `inventory_report_${Date.now()}`);
}

export function generateInventoryReportPDF(products: Product[]): void {
  const headers = ['SKU', 'Name', 'Category', 'Metal', 'Weight', 'Stock', 'Valuation'];
  const rows = products.map(p => [
    p.sku,
    p.name,
    p.category,
    p.metal,
    `${p.weight}g`,
    `${p.stock} u`,
    `$${(p.sellingPrice * p.stock).toLocaleString()}`
  ]);
  exportToPDF({
    title: 'Auric Jewels - Inventory Stock & Valuation Report',
    headers,
    rows,
    fileName: `inventory_report_${Date.now()}`
  });
}

export function generateProductionReportExcel(jobs: ProductionJob[]): void {
  const data = jobs.map(j => ({
    'Job ID': j.jobId,
    'Order #': j.orderNumber || 'Custom',
    'Product Name': j.productName,
    'Craftsman': j.craftsman,
    'Stage': j.stage,
    'Status': j.status,
    'Started Date': j.startedAt,
    'Target Date': j.expectedDate,
    'Progress (%)': j.progressBar
  }));
  exportToExcel(data, 'Manufacturing Pipeline', `production_report_${Date.now()}`);
}

export function generateProductionReportPDF(jobs: ProductionJob[]): void {
  const headers = ['Job ID', 'Product', 'Craftsman', 'Stage', 'Status', 'Progress'];
  const rows = jobs.map(j => [
    j.jobId,
    j.productName,
    j.craftsman,
    j.stage,
    j.status,
    `${j.progressBar}%`
  ]);
  exportToPDF({
    title: 'Auric Jewels - Manufacturing Pipeline Report',
    headers,
    rows,
    fileName: `production_report_${Date.now()}`
  });
}

export function generateSupplierReportExcel(suppliers: Supplier[]): void {
  const data = suppliers.map(s => ({
    'Name': s.name,
    'Contact': s.contactPerson,
    'Email': s.email,
    'Phone': s.phone,
    'Category': s.category,
    'Rating': s.rating,
    'Lead Time (Days)': s.leadTimeDays,
    'Terms': s.paymentTerms,
    'Active Status': s.isActive ? 'Active' : 'Inactive'
  }));
  exportToExcel(data, 'Suppliers Directory', `suppliers_report_${Date.now()}`);
}

export function generateSupplierReportPDF(suppliers: Supplier[]): void {
  const headers = ['Name', 'Contact', 'Email', 'Category', 'Rating', 'Lead Time'];
  const rows = suppliers.map(s => [
    s.name,
    s.contactPerson,
    s.email,
    s.category,
    `${s.rating} Stars`,
    `${s.leadTimeDays} days`
  ]);
  exportToPDF({
    title: 'Auric Jewels - Supplier Directory & Performance Report',
    headers,
    rows,
    fileName: `suppliers_report_${Date.now()}`
  });
}

export function generatePOInvoicePDF(po: PurchaseOrder): void {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55);
  doc.text('PURCHASE ORDER', 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`PO Number: ${po.poNumber}`, 15, 26);
  doc.text(`Order Date: ${po.orderDate}`, 15, 31);
  doc.text(`Delivery Target: ${po.expectedDelivery}`, 15, 36);
  doc.text(`Status: ${po.status}`, 15, 41);

  // Supplier details
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text('Supplier:', 130, 20);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(po.supplierName, 130, 26);
  doc.text('Auric Jewels Ltd procurement', 130, 31);

  // Items
  const headers = ['Item Name', 'SKU', 'Ordered Qty', 'Unit Cost', 'Weight (g)', 'Subtotal'];
  const rows = po.items.map(item => [
    item.name,
    item.sku,
    item.orderedQty,
    `$${item.unitCost}`,
    `${item.weight}g`,
    `$${(item.unitCost * item.orderedQty).toLocaleString()}`
  ]);

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 55,
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [212, 175, 55] }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  
  // Summary cost
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text(`Total Cost Valuation: $${po.totalCost.toLocaleString()}`, 15, finalY + 15);
  
  if (po.notes) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Remarks: ${po.notes}`, 15, finalY + 25);
  }

  doc.save(`Invoice_${po.poNumber}.pdf`);
}
