// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ Service Role: úsalo solo en el servidor (rutas API / páginas server)
export const supabaseServer = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
