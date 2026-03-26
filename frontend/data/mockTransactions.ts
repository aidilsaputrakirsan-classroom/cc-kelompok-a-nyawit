export type TransactionType = 'masuk' | 'keluar' | 'mutasi' | 'adjust';

export type AdjustType = 'tambah' | 'kurang';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;        // ISO date string
  assetId: string;
  assetName: string;
  category: string;
  quantity: number;
  fromLocation?: string;   // for mutasi
  toLocation?: string;     // for mutasi & masuk
  location?: string;       // for masuk / keluar / adjust
  adjustType?: AdjustType; // for adjust
  reason?: string;
  picName: string;   // Person in Charge
  notes?: string;
  createdAt: string;
}

const locations = ['Rak A', 'Rak B', 'Rak C', 'Rak D', 'Rak E', 'Rak F', 'Lantai', 'Lemari kaca'];
const assetNames = ['Laptop Dell XPS', 'Monitor LG 24"', 'Keyboard Logitech', 'Mouse Wireless', 'Server HP ProLiant', 'Printer Epson', 'Webcam Logitech', 'Headset Sony', 'Tablet Samsung', 'Desktop PC'];
const pics = ['Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi', 'Dewi Lestari', 'Reza Pratama'];
const reasons = ['Pembelian baru', 'Returned from repair', 'Unit dihapus dari inventaris', 'Temuan audit', 'Permintaan divisi', 'Pemindahan ruangan'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
}

function generateId(type: TransactionType, index: number): string {
  const prefix: Record<TransactionType, string> = {
    masuk: 'MSK', keluar: 'KLR', mutasi: 'MUT', adjust: 'ADJ'
  };
  return `${prefix[type]}-${String(index).padStart(4, '0')}`;
}

function generateTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  let idx = 1;

  const types: TransactionType[] = ['masuk', 'keluar', 'mutasi', 'adjust'];

  for (let i = 0; i < 60; i++) {
    const type = types[i % 4];
    const date = randomDate(new Date('2025-01-01'), new Date('2026-03-26'));
    const asset = randomFrom(assetNames);
    const cat = ['Laptop', 'Server', 'Tablet'].some(k => asset.includes(k)) ? 'Hardware' : 'Peripherals';

    const base = {
      id: generateId(type, idx++),
      type,
      date,
      assetId: `AST-${String(i + 1).padStart(3, '0')}`,
      assetName: asset,
      category: cat,
      quantity: Math.floor(Math.random() * 5) + 1,
      picName: randomFrom(pics),
      notes: Math.random() > 0.5 ? randomFrom(reasons) : undefined,
      createdAt: date,
    };

    if (type === 'masuk') {
      txs.push({ ...base, location: randomFrom(locations), reason: randomFrom(reasons) });
    } else if (type === 'keluar') {
      txs.push({ ...base, location: randomFrom(locations), reason: randomFrom(reasons) });
    } else if (type === 'mutasi') {
      const from = randomFrom(locations);
      let to = randomFrom(locations);
      while (to === from) to = randomFrom(locations);
      txs.push({ ...base, fromLocation: from, toLocation: to });
    } else {
      const adjustType: AdjustType = Math.random() > 0.5 ? 'tambah' : 'kurang';
      txs.push({ ...base, location: randomFrom(locations), adjustType, reason: randomFrom(reasons) });
    }
  }

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

export const mockTransactions = generateTransactions();
