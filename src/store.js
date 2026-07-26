import { supabase, isSupabaseEnabled } from './supabase';

// Map DB lowercase column names back to the camelCase keys used in the app
const FIELD_MAP = {
  equipment: {
    serialnumber: 'serialNumber',
    imageurl: 'imageUrl',
    dailyrate: 'dailyRate',
    createdat: 'createdAt',
    updatedat: 'updatedAt',
  },
  bookings: {
    equipmentid: 'equipmentId',
    equipmentname: 'equipmentName',
    userid: 'userId',
    username: 'userName',
    fromdate: 'fromDate',
    todate: 'toDate',
    createdat: 'createdAt',
    updatedat: 'updatedAt',
  },
  queue: {
    equipmentid: 'equipmentId',
    equipmentname: 'equipmentName',
    userid: 'userId',
    username: 'userName',
    joinedat: 'joinedAt',
    createdat: 'createdAt',
  },
  users: {
    joindate: 'joinDate',
    createdat: 'createdAt',
  },
};

const dbRowToApp = (table, row) => {
  if (!row || typeof row !== 'object') return row;
  const map = FIELD_MAP[table] || {};
  return Object.fromEntries(Object.entries(row).map(([k, v]) => {
    if (map[k]) return [map[k], v];
    // if key is already camel-case-like (contains uppercase) or simple, try to camelize common patterns
    if (k.includes('_')) {
      const camel = k.split('_').map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
      return [camel, v];
    }
    // leave single-word lowercase keys like 'name', 'id', 'status' as-is
    return [k, v];
  }));
};

const toDb = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));

// ─── SEED DATA ──────────────────────────────────────────────
export const SEED_EQUIPMENT = [
  // Laptops
  { id: 'eq001', name: 'Dell XPS 15', category: 'Laptop', condition: 'Excellent', serialNumber: 'DXPS15-2024-001', specs: '15.6" OLED, Intel i9, 32GB RAM, 1TB SSD', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq002', name: 'MacBook Pro 16"', category: 'Laptop', condition: 'Good', serialNumber: 'MBP16-2023-002', specs: 'M3 Pro, 18GB RAM, 512GB SSD', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq003', name: 'Lenovo ThinkPad X1 Carbon', category: 'Laptop', condition: 'Good', serialNumber: 'TPXC-2023-003', specs: '14" 2.8K, Intel i7, 16GB RAM, 512GB SSD', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq004', name: 'ASUS ROG Zephyrus G14', category: 'Laptop', condition: 'Fair', serialNumber: 'ROGZ-2022-004', specs: '14" QHD, Ryzen 9, 16GB RAM, RTX 3060', status: 'overdue', imageUrl: null, dailyRate: 0 },
  { id: 'eq005', name: 'HP Spectre x360', category: 'Laptop', condition: 'Excellent', serialNumber: 'HPSX-2024-005', specs: '13.5" OLED Touch, Intel i7, 16GB RAM', status: 'available', imageUrl: null, dailyRate: 0 },

  // Cameras
  { id: 'eq006', name: 'Sony A7 IV', category: 'Camera', condition: 'Excellent', serialNumber: 'SA7IV-2024-006', specs: '33MP Full-Frame Mirrorless, 4K 60fps, 5-axis IBIS', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq007', name: 'Canon EOS R5', category: 'Camera', condition: 'Good', serialNumber: 'CEOSR5-2023-007', specs: '45MP Full-Frame, 8K RAW, IBIS, Dual Card', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq008', name: 'Nikon Z8', category: 'Camera', condition: 'Excellent', serialNumber: 'NZ8-2024-008', specs: '45.7MP BSI CMOS, 8K 60fps, 20fps Burst', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq009', name: 'Fujifilm X-T5', category: 'Camera', condition: 'Good', serialNumber: 'FXT5-2023-009', specs: '40MP APS-C, 6.2K Video, 5-axis IBIS', status: 'overdue', imageUrl: null, dailyRate: 0 },

  // Tablets
  { id: 'eq010', name: 'iPad Pro 12.9" M4', category: 'Tablet', condition: 'Excellent', serialNumber: 'IPADM4-2024-010', specs: '12.9" Liquid Retina XDR, M4 chip, 256GB', status: 'available', imageUrl: null, dailyRate: 0 },
  { id: 'eq011', name: 'Samsung Galaxy Tab S9 Ultra', category: 'Tablet', condition: 'Good', serialNumber: 'SGTS9U-2023-011', specs: '14.6" AMOLED, Snapdragon 8 Gen 2, S Pen', status: 'in_use', imageUrl: null, dailyRate: 0 },
  { id: 'eq012', name: 'Microsoft Surface Pro 10', category: 'Tablet', condition: 'Good', serialNumber: 'MSP10-2024-012', specs: '13" PixelSense, Intel Core Ultra 7, 16GB RAM', status: 'available', imageUrl: null, dailyRate: 0 },
];

export const SEED_USERS = [
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

export const SEED_BOOKINGS = [
  { id: 'b001', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u001', userName: 'Brian Otieno', fromDate: fmt(addDays(today, -5)), toDate: fmt(addDays(today, 2)), status: 'confirmed', notes: 'Freelance design project' },
  { id: 'b002', equipmentId: 'eq007', equipmentName: 'Canon EOS R5', userId: 'u002', userName: 'Amina Yusuf', fromDate: fmt(addDays(today, -3)), toDate: fmt(addDays(today, 4)), status: 'confirmed', notes: 'Wedding photography gig' },
  { id: 'b003', equipmentId: 'eq011', equipmentName: 'Samsung Galaxy Tab S9 Ultra', userId: 'u003', userName: 'Kevin Omondi', fromDate: fmt(addDays(today, -2)), toDate: fmt(addDays(today, 5)), status: 'confirmed', notes: 'Online course material' },
  { id: 'b004', equipmentId: 'eq004', equipmentName: 'ASUS ROG Zephyrus G14', userId: 'u004', userName: 'Mercy Wanjiku', fromDate: fmt(addDays(today, -10)), toDate: fmt(addDays(today, -3)), status: 'overdue', notes: 'Video editing work' },
  { id: 'b005', equipmentId: 'eq009', equipmentName: 'Fujifilm X-T5', userId: 'u005', userName: 'John Kamau', fromDate: fmt(addDays(today, -8)), toDate: fmt(addDays(today, -5)), status: 'overdue', notes: 'Documentary project' },
  { id: 'b006', equipmentId: 'eq001', equipmentName: 'Dell XPS 15', userId: 'u001', userName: 'Brian Otieno', fromDate: fmt(addDays(today, 1)), toDate: fmt(addDays(today, 7)), status: 'pending', notes: 'Web dev contract' },
  { id: 'b007', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u003', userName: 'Kevin Omondi', fromDate: fmt(addDays(today, 3)), toDate: fmt(addDays(today, 9)), status: 'pending', notes: 'App development' },
  { id: 'b008', equipmentId: 'eq006', equipmentName: 'Sony A7 IV', userId: 'u002', userName: 'Amina Yusuf', fromDate: fmt(addDays(today, 2)), toDate: fmt(addDays(today, 6)), status: 'pending', notes: 'Product photography' },
];

export const SEED_QUEUE = [
  { id: 'q001', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u003', userName: 'Kevin Omondi', position: 1, estimatedWait: '3 Days', joinedAt: fmt(addDays(today, -1)) },
  { id: 'q002', equipmentId: 'eq002', equipmentName: 'MacBook Pro 16"', userId: 'u001', userName: 'Brian Otieno', position: 2, estimatedWait: '5 Days', joinedAt: fmt(today) },
  { id: 'q003', equipmentId: 'eq007', equipmentName: 'Canon EOS R5', userId: 'u004', userName: 'Mercy Wanjiku', position: 1, estimatedWait: '4 Days', joinedAt: fmt(addDays(today, -2)) },
  { id: 'q004', equipmentId: 'eq011', equipmentName: 'Samsung Galaxy Tab S9 Ultra', userId: 'u002', userName: 'Amina Yusuf', position: 1, estimatedWait: '5 Days', joinedAt: fmt(today) },
];

// ─── SUPABASE HELPERS ────────────────────────────────────────
const fallback = (data, seed) => (Array.isArray(data) && data.length > 0 ? data : seed);

export const seedDatabase = async () => {
  if (!isSupabaseEnabled || !supabase) {
    return false;
  }

  try {
    const batches = [
      { table: 'equipment', items: SEED_EQUIPMENT },
      { table: 'users', items: SEED_USERS },
      { table: 'bookings', items: SEED_BOOKINGS },
      { table: 'queue', items: SEED_QUEUE },
    ];

    for (const { table, items } of batches) {
      // Normalize object keys to lowercase to match Postgres column names
      const normalized = items.map(item => Object.fromEntries(
        Object.entries(item).map(([k, v]) => [k.toLowerCase(), v])
      ));

      const { error } = await supabase.from(table).upsert(normalized, { onConflict: 'id' });
      if (error) throw error;
    }

    console.log('✅ Supabase seeded successfully');
    return true;
  } catch (err) {
    console.error('Seed error (likely missing Supabase config)', err);
    return false;
  }
};

export const subscribeEquipment = (callback) => {
  if (!isSupabaseEnabled || !supabase) {
    callback(SEED_EQUIPMENT);
    return () => {};
  }

  supabase.from('equipment').select('*').then(({ data, error }) => {
    if (error || !data) {
      callback(SEED_EQUIPMENT);
      return;
    }
    const appData = data.map(r => dbRowToApp('equipment', r));
    callback(fallback(appData, SEED_EQUIPMENT));
  }).catch(() => callback(SEED_EQUIPMENT));

  return () => {};
};

export const subscribeBookings = (callback) => {
  if (!isSupabaseEnabled || !supabase) {
    callback(SEED_BOOKINGS);
    return () => {};
  }

  supabase.from('bookings').select('*').then(({ data, error }) => {
    if (error || !data) {
      callback(SEED_BOOKINGS);
      return;
    }
    const appData = data.map(r => dbRowToApp('bookings', r));
    callback(fallback(appData, SEED_BOOKINGS));
  }).catch(() => callback(SEED_BOOKINGS));

  return () => {};
};

export const subscribeQueue = (callback) => {
  if (!isSupabaseEnabled || !supabase) {
    callback(SEED_QUEUE);
    return () => {};
  }

  supabase.from('queue').select('*').then(({ data, error }) => {
    if (error || !data) {
      callback(SEED_QUEUE);
      return;
    }
    const appData = data.map(r => dbRowToApp('queue', r));
    callback(fallback(appData, SEED_QUEUE));
  }).catch(() => callback(SEED_QUEUE));

  return () => {};
};

export const subscribeUsers = (callback) => {
  if (!isSupabaseEnabled || !supabase) {
    callback(SEED_USERS);
    return () => {};
  }

  supabase.from('users').select('*').then(({ data, error }) => {
    if (error || !data) {
      callback(SEED_USERS);
      return;
    }
    const appData = data.map(r => dbRowToApp('users', r));
    callback(fallback(appData, SEED_USERS));
  }).catch(() => callback(SEED_USERS));

  return () => {};
};

export const addBooking = async (booking) => {
  const id = `b${Date.now()}`;
  const data = { ...booking, id, status: 'pending', createdAt: new Date().toISOString() };

  if (isSupabaseEnabled && supabase) {
    const dbData = toDb(data);
    const { error } = await supabase.from('bookings').insert([dbData]);
    if (!error) return data;
  }

  return data;
};

export const updateBookingStatus = async (id, status) => {
  if (isSupabaseEnabled && supabase) {
    await supabase.from('bookings').update({ status, updatedAt: new Date().toISOString() }).eq('id', id);
  }
};

export const addEquipment = async (equipment) => {
  const id = `eq${Date.now()}`;
  const data = { ...equipment, id, status: 'available', createdAt: new Date().toISOString() };

  if (isSupabaseEnabled && supabase) {
    const dbData = toDb(data);
    const { error } = await supabase.from('equipment').insert([dbData]);
    if (!error) return data;
  }

  return data;
};

export const updateEquipment = async (id, data) => {
  if (isSupabaseEnabled && supabase) {
    const db = toDb({ ...data, updatedAt: new Date().toISOString() });
    await supabase.from('equipment').update(db).eq('id', id);
  }
};

export const deleteEquipment = async (id) => {
  if (isSupabaseEnabled && supabase) {
    await supabase.from('equipment').delete().eq('id', id);
  }
};

export const joinQueue = async (queueItem) => {
  const id = `q${Date.now()}`;
  const data = { ...queueItem, id, joinedAt: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };

  if (isSupabaseEnabled && supabase) {
    const dbData = toDb(data);
    const { error } = await supabase.from('queue').insert([dbData]);
    if (!error) return data;
  }

  return data;
};

export const removeFromQueue = async (id) => {
  if (isSupabaseEnabled && supabase) {
    await supabase.from('queue').delete().eq('id', id);
  }
};

export const addUser = async (user) => {
  const id = `u${Date.now()}`;
  const data = { ...user, id, joinDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };

  if (isSupabaseEnabled && supabase) {
    const dbData = toDb(data);
    const { error } = await supabase.from('users').insert([dbData]);
    if (!error) return data;
  }

  return data;
};
