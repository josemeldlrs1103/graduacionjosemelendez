// app/api/admin/invites/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getToken(req: Request) {
  const h = req.headers.get('x-admin-token') || '';
  if (h) return h;
  const sp = new URL(req.url).searchParams;
  return sp.get('key') || '';
}

function requireAdmin(req: Request) {
  const tok = getToken(req);
  return !!process.env.ADMIN_TOKEN && tok === process.env.ADMIN_TOKEN;
}

type InviteRow = {
  slug: string;
  name: string;
  limit_guests: number;
};

// Genera un slug corto (5 letras) y verifica disponibilidad
async function generateUniqueSlug(): Promise<string> {
  const supabase = supabaseAdmin();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (let attempt = 0; attempt < 8; attempt++) {
    let slug = '';
    for (let i = 0; i < 5; i++) {
      slug += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const { data, error } = await supabase
      .from('invites')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug; // libre
  }
  // fallback extremadamente raro
  return `z${Date.now().toString(36).slice(-4)}`.slice(0, 5);
}

// GET /api/admin/invites
export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('invites')
    .select('slug, name, limit_guests')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invites: data as InviteRow[] });
}

// POST /api/admin/invites
// Crear:    { name: string, limit_guests: number }        (sin slug => se genera)
// Actualizar:{ slug: string, name: string, limit_guests: number }
export async function POST(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  let body: Partial<InviteRow> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const isUpdate = !!body.slug;

  if (isUpdate) {
    const { slug } = body;
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const limit =
      typeof body.limit_guests === 'number' ? body.limit_guests : NaN;

    if (!name || !Number.isFinite(limit) || limit <= 0) {
      return NextResponse.json(
        { error: 'Nombre y límite son obligatorios' },
        { status: 400 }
      );
    }

    // ✅ upsert por slug (robusto para actualizar)
    const { data, error } = await supabase
      .from('invites')
      .upsert({ slug, name, limit_guests: limit }, { onConflict: 'slug' })
      .select('slug, name, limit_guests')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });

    return NextResponse.json({ invite: data as InviteRow });
  }

  // Crear nuevo
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const limit =
    typeof body.limit_guests === 'number' ? body.limit_guests : NaN;

  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  if (!Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json({ error: 'Invalid limit_guests' }, { status: 400 });
  }

  const slug = await generateUniqueSlug();

  const { data, error } = await supabase
    .from('invites')
    .upsert({ slug, name, limit_guests: limit }, { onConflict: 'slug' }) // también upsert por si acaso
    .select('slug, name, limit_guests')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 });

  return NextResponse.json({ invite: data as InviteRow });
}

// DELETE /api/admin/invites
// Body: { slug: string }
export async function DELETE(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { slug?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('invites').delete().eq('slug', slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
