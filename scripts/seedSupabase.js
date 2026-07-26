import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envRaw = await fs.readFile(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = envRaw.split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1]] = m[2];
  return acc;
}, {});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('.env.local must include VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const equipment = [
  { id: 'eq001', name: 'Dell XPS 15', category: 'Laptop', condition: 'Excellent', serialNumber: 'DXPS15-2024-001', specs: '15.6" OLED, Intel i9, 32GB RAM, 1TB SSD', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq002', name: 'MacBook Pro 16"', category: 'Laptop', condition: 'Good', serialNumber: 'MBP16-2023-002', specs: 'M3 Pro, 18GB RAM, 512GB SSD', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq003', name: 'Lenovo ThinkPad X1 Carbon', category: 'Laptop', condition: 'Good', serialNumber: 'TPXC-2023-003', specs: '14" 2.8K, Intel i7, 16GB RAM, 512GB SSD', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq004', name: 'ASUS ROG Zephyrus G14', category: 'Laptop', condition: 'Fair', serialNumber: 'ROGZ-2022-004', specs: '14" QHD, Ryzen 9, 16GB RAM, RTX 3060', status: 'overdue', imageUrl: null, dailyRate: 0 },
  { id: 'eq005', name: 'HP Spectre x360', category: 'Laptop', condition: 'Excellent', serialNumber: 'HPSX-2024-005', specs: '13.5" OLED Touch, Intel i7, 16GB RAM', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq006', name: 'Sony A7 IV', category: 'Camera', condition: 'Excellent', serialNumber: 'SA7IV-2024-006', specs: '33MP Full-Frame Mirrorless, 4K 60fps, 5-axis IBIS', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq007', name: 'Canon EOS R5', category: 'Camera', condition: 'Good', serialNumber: 'CEOSR5-2023-007', specs: '45MP Full-Frame, 8K RAW, IBIS, Dual Card', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq008', name: 'Nikon Z8', category: 'Camera', condition: 'Excellent', serialNumber: 'NZ8-2024-008', specs: '45.7MP BSI CMOS, 8K 60fps, 20fps Burst', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq009', name: 'Fujifilm X-T5', category: 'Camera', condition: 'Good', serialNumber: 'FXT5-2023-009', specs: '40MP APS-C, 6.2K Video, 5-axis IBIS', status: 'overdue', imageUrl: null, dailyRate: 0 },
  { id: 'eq010', name: 'iPad Pro 12.9" M4', category: 'Tablet', condition: 'Excellent', serialNumber: 'IPADM4-2024-010', specs: '12.9" Liquid Retina XDR, M4 chip, 256GB', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq011', name: 'Samsung Galaxy Tab S9 Ultra', category: 'Tablet', condition: 'Good', serialNumber: 'SGTS9U-2023-011', specs: '14.6" AMOLED, Snapdragon 8 Gen 2, S Pen', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq012', name: 'Microsoft Surface Pro 10', category: 'Tablet', condition: 'Good', serialNumber: 'MSP10-2024-012', specs: '13" PixelSense, Intel Core Ultra 7, 16GB RAM', status: 'available', imageUrl: null, dailyRate: 0 },
];

const users = [
  { id: 'u001', name: 'Brian Otieno', email: 'brian@kibera.org', phone: '+254712345678', role: 'borrower', status: 'active', joinDate: '2024-01-15' },
  { id: 'u002', name: 'Amina Yusuf', email: 'amina@kibera.org', phone: '+254723456789', role: 'borrower', status: 'active', joinDate: '2024-02-10' },
  { id: 'u003', name: 'Kevin Omondi', email: 'kevin@kibera.org', phone: '+254734567890', role: 'borrower', status: 'active', joinDate: '2024-01-20' },
  { id: 'u004', name: 'Linet Mwangi', email: 'linet@kibera.org', phone: '+254745678901', role: 'borrower', status: 'active', joinDate: '2024-03-05' },
  { id: 'u005', name: 'John Kamau', email: 'john@kibera.org', phone: '+254756789012', role: 'borrower', status: 'active', joinDate: '2024-02-20' },
  { id: 'u006', name: 'Librarian Admin', email: 'admin@kibera.org', phone: '+254700000001', role: 'staff', status: 'active', joinDate: '2023-12-01' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const bookings = [
  { id: 'b001', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u001', userName: 'Brian Otieno', fromDate: fmt(addDays(today, -5)), toDate: fmt(addDays(today, 2)), status: 'confirmed', notes: 'Freelance design project' },
  { id: 'b002', equipmentId: 'eq007', equipmentName: 'Canon EOS R5', userId: 'u002', userName: 'Amina Yusuf', fromDate: fmt(addDays(today, -3)), toDate: fmt(addDays(today, 4)), status: 'confirmed', notes: 'Wedding photography gig' },
  { id: 'b003', equipmentId: 'eq011', equipmentName: 'Samsung Galaxy Tab S9 Ultra', userId: 'u003', userName: 'Kevin Omondi', fromDate: fmt(addDays(today, -2)), toDate: fmt(addDays(today, 5)), status: 'confirmed', notes: 'Online course material' },
  { id: 'b004', equipmentId: 'eq004', equipmentName: 'ASUS ROG Zephyrus G14', userId: 'u004', userName: 'Mercy Wanjiku', fromDate: fmt(addDays(today, -10)), toDate: fmt(addDays(today, -3)), status: 'overdue', notes: 'Video editing work' },
  { id: 'b005', equipmentId: 'eq009', equipmentName: 'Fujifilm X-T5', userId: 'u005', userName: 'John Kamau', fromDate: fmt(addDays(today, -8)), toDate: fmt(addDays(today, -5)), status: 'overdue', notes: 'Documentary project' },
  { id: 'b006', equipmentId: 'eq001', equipmentName: 'Dell XPS 15', userId: 'u001', userName: 'Brian Otieno', fromDate: fmt(addDays(today, 1)), toDate: fmt(addDays(today, 7)), status: 'pending', notes: 'Web dev contract' },
  { id: 'b007', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u003', userName: 'Kevin Omondi', fromDate: fmt(addDays(today, 3)), toDate: fmt(addDays(today, 9)), status: 'pending', notes: 'App development' },
  { id: 'b008', equipmentId: 'eq006', equipmentName: 'Sony A7 IV', userId: 'u002', userName: 'Amina Yusuf', fromDate: fmt(addDays(today, 2)), toDate: fmt(addDays(today, 6)), status: 'pending', notes: 'Product photography' },
];

const queue = [
  { id: 'q001', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u003', userName: 'Kevin Omondi', position: 1, estimatedWait: '3 Days', joinedAt: fmt(addDays(today, -1)) },
  { id: 'q002', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u001', userName: 'Brian Otieno', position: 2, estimatedWait: '5 Days', joinedAt: fmt(today) },
  { id: 'q003', equipmentId: 'eq007', equipmentName: 'Canon EOS R5', userId: 'u004', userName: 'Mercy Wanjiku', position: 1, estimatedWait: '4 Days', joinedAt: fmt(addDays(today, -2)) },
  { id: 'q004', equipmentId: 'eq011', equipmentName: 'Samsung Galaxy Tab S9 Ultra', userId: 'u002', userName: 'Amina Yusuf', position: 1, estimatedWait: '5 Days', joinedAt: fmt(today) },
];

const normalize = (items) => items.map(item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k.toLowerCase(), v])));

const batches = [
  { table: 'equipment', items: equipment },
  { table: 'users', items: users },
  { table: 'bookings', items: bookings },
  { table: 'queue', items: queue },
];

for (const { table, items } of batches) {
  const normalized = normalize(items);
  const { error } = await supabase.from(table).upsert(normalized, { onConflict: 'id' });
  if (error) {
    console.error('Seed failed for', table, error);
    process.exit(1);
  }
  console.log('Seeded', table);
}

console.log('All tables seeded successfully');
