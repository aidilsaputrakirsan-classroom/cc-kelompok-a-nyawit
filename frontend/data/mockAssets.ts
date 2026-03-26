export type AssetStatus = 'In Use' | 'Available' | 'Under Maintenance' | 'Retired';
export type AssetCategory = 'Hardware' | 'Software' | 'Peripherals';

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: AssetCategory;
  location: string;
  status: AssetStatus;
  assignedTo: string;
  purchaseDate: string;
  lastUpdate: string;
  condition: AssetCondition;
  value: number;
}

const assetTypes = {
  Hardware: ['Laptop', 'Desktop', 'Server', 'Tablet', 'Smartphone'],
  Software: ['Software License', 'OS License', 'Cloud Subscription', 'Antivirus License', 'Design Suite'],
  Peripherals: ['Monitor', 'Keyboard', 'Mouse', 'Printer', 'Webcam', 'Headset', 'Docking Station']
};

const locations = ['New York Office', 'San Francisco Office', 'London Office', 'Remote', 'Warehouse', 'Chicago Office'];
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

function generateMockAssets(count: number): Asset[] {
  const assets: Asset[] = [];
  const categories: AssetCategory[] = ['Hardware', 'Software', 'Peripherals'];
  
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
    const value = Math.floor(Math.random() * 5000) + 500;

    assets.push({
      id: generateAssetId(category, i),
      name: `${type} ${i}`,
      type,
      category,
      location,
      status,
      assignedTo,
      purchaseDate,
      lastUpdate,
      condition,
      value
    });
  }
  
  return assets;
}

export const mockAssets = generateMockAssets(0);

