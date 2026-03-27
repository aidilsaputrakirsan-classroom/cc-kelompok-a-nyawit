export type AssetStatus = 'In Use' | 'Available' | 'Under Maintenance' | 'Retired';
export type AssetCategory = 'Hardware' | 'Peripherals' | 'Consumables';

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: AssetCategory;
  location: string;
  status: AssetStatus;
  assignedTo: string;
  serialNumber: string;
  productNumber: string;
  modelNumber: string;
  purchaseDate: string;
  lastUpdate: string;
  condition: AssetCondition;
  quantity: number;
}

export interface Consumable {
  id: string;
  name: string;
  type: string;           // e.g. 'Tinta Printer', 'Cartridge', 'Kabel'
  category: 'Consumables';
  location: string;
  stock: number;
  unit: string;           // 'pcs', 'roll', 'box', etc.
  minStock: number;       // threshold for low-stock warning
  lastUpdate: string;
}

const assetTypes = {
  Hardware: ['Laptop', 'Desktop', 'Server', 'Tablet', 'Smartphone'],
  Peripherals: ['Monitor', 'Keyboard', 'Mouse', 'Printer', 'Webcam', 'Headset', 'Docking Station'],
};

const locations = ['Rak A', 'Rak B', 'Rak C', 'Rak D', 'Rak E', 'Rak F', 'Lantai', 'Lemari kaca'];
const statuses: AssetStatus[] = ['In Use', 'Available', 'Under Maintenance', 'Retired'];
const conditions: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const employees = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson',
  'Jennifer Martinez', 'David Brown', 'Lisa Anderson', 'James Taylor', 'Mary Thompson',
  'Christopher Lee', 'Patricia White', 'Daniel Harris', 'Linda Clark', 'Matthew Lewis',
  'Unassigned', 'IT Department', 'Finance Team', 'Marketing Team', 'Sales Team'
];

function generateAssetId(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function padNumber(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

function generateSerialNumber(type: string, index: number): string {
  const prefix = type.substring(0, 3).toUpperCase();
  return `SN-${prefix}-${padNumber((index * 37) % 100000, 5)}`;
}

function generateProductNumber(category: string, type: string, index: number): string {
  const categoryPrefix = category.substring(0, 1).toUpperCase();
  const typePrefix = type.substring(0, 2).toUpperCase();
  return `PN-${categoryPrefix}${typePrefix}-${padNumber(index, 4)}`;
}

function generateModelNumber(type: string, index: number): string {
  const base = type.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const year = 2020 + (index % 6);
  return `${base}-${year}-${padNumber((index * 19) % 1000, 3)}`;
}

function generateMockAssets(count: number): Asset[] {
  const assets: Asset[] = [];
  const categories: Array<'Hardware' | 'Peripherals'> = ['Hardware', 'Peripherals'];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const types = assetTypes[category];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const assignedTo = status === 'In Use' 
      ? employees[Math.floor(Math.random() * (employees.length - 4))]
      : status === 'Available' 
        ? 'Unassigned'
        : employees[Math.floor(Math.random() * employees.length)];
    
    const purchaseDate = getRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
    const lastUpdate = getRandomDate(new Date(2024, 0, 1), new Date(2025, 9, 9));
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const serialNumber = generateSerialNumber(type, i);
    const productNumber = generateProductNumber(category, type, i);
    const modelNumber = generateModelNumber(type, i);

    assets.push({
      id: generateAssetId(category, i),
      name: `${type} ${i}`,
      type,
      category,
      location,
      status,
      assignedTo,
      serialNumber,
      productNumber,
      modelNumber,
      purchaseDate,
      lastUpdate,
      condition,
      quantity,
    });
  }
  
  return assets;
}

export const mockAssets = generateMockAssets(100);

// ─── Consumables mock data ─────────────────────────────────────────────────────

export const mockConsumables: Consumable[] = [
  { id: 'CON-001', name: 'Tinta Printer Cyan',    type: 'Tinta Printer', category: 'Consumables', location: 'Rak A', stock: 12, unit: 'pcs', minStock: 5,  lastUpdate: '2026-03-20' },
  { id: 'CON-002', name: 'Tinta Printer Magenta', type: 'Tinta Printer', category: 'Consumables', location: 'Rak A', stock: 8,  unit: 'pcs', minStock: 5,  lastUpdate: '2026-03-20' },
  { id: 'CON-003', name: 'Tinta Printer Black',   type: 'Tinta Printer', category: 'Consumables', location: 'Rak A', stock: 3,  unit: 'pcs', minStock: 5,  lastUpdate: '2026-03-22' },
  { id: 'CON-004', name: 'Tinta Printer Yellow',  type: 'Tinta Printer', category: 'Consumables', location: 'Rak A', stock: 15, unit: 'pcs', minStock: 5,  lastUpdate: '2026-03-15' },
  { id: 'CON-005', name: 'Cartridge Cyan',        type: 'Cartridge',     category: 'Consumables', location: 'Rak B', stock: 4,  unit: 'pcs', minStock: 3,  lastUpdate: '2026-03-18' },
  { id: 'CON-006', name: 'Cartridge Magenta',     type: 'Cartridge',     category: 'Consumables', location: 'Rak B', stock: 2,  unit: 'pcs', minStock: 3,  lastUpdate: '2026-03-18' },
  { id: 'CON-007', name: 'Cartridge Black',       type: 'Cartridge',     category: 'Consumables', location: 'Rak B', stock: 6,  unit: 'pcs', minStock: 3,  lastUpdate: '2026-03-10' },
  { id: 'CON-008', name: 'Cartridge Yellow',      type: 'Cartridge',     category: 'Consumables', location: 'Rak B', stock: 1,  unit: 'pcs', minStock: 3,  lastUpdate: '2026-03-25' },
  { id: 'CON-009', name: 'Kabel RJ45',            type: 'Kabel Jaringan',category: 'Consumables', location: 'Rak C', stock: 50, unit: 'pcs', minStock: 10, lastUpdate: '2026-03-01' },
];
