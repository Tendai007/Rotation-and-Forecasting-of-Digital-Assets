import fs from 'fs/promises';
import path from 'path';

try {
  const envRaw = await fs.readFile(path.resolve(process.cwd(), '.env.local'), 'utf8');
  const env = envRaw.split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) acc[m[1]] = m[2];
    return acc;
  }, {});

  const SUPABASE_URL = env.VITE_SUPABASE_URL;
  const ANON = env.VITE_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !ANON) throw new Error('.env.local missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/equipment`;
  const body = [{ id: 'node-test-eq-' + Date.now(), name: 'Node Test Device', category: 'Test', status: 'available' }];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body)
  });

  console.log('status', res.status);
  const text = await res.text();
  console.log('body', text);
} catch (err) {
  console.error(err);
  process.exit(1);
}
