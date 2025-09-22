// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

// Cliente SOLO para backend (usa SERVICE ROLE). No lo importes en Client Components.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-application-name': 'graduacionjosemelendez' } },
  });
}

// (opcional) tipo útil si lo quieres usar en otros archivos
export type SupabaseAdminClient = ReturnType<typeof supabaseAdmin>;
