// app/api/rsvp/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAdmin(req: Request) {
  const tok = req.headers.get('x-admin-token') || '';
  return !!process.env.ADMIN_TOKEN && tok === process.env.ADMIN_TOKEN;
}

export async function GET(req: Request) {
  const supabase = supabaseAdmin();

  // Modo ADMIN: lista todo
  if (isAdmin(req)) {
    const { data, error } = await supabase
      .from('rsvps')
      .select('slug, attending, guests, attendee_names, updated_at')
      .order('updated_at', { ascending: false, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rsvps: data || [] });
  }

  // Modo INVITADO: requiere ?slug=
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('rsvps')
    .select('slug, attending, guests, attendee_names, updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rsvp: data ?? null });
}

export async function POST(req: Request) {
  // Solo se usa para crear/actualizar una respuesta de un slug concreto (desde la página Confirmar)
  let body: {
    slug?: string;
    attending?: boolean;
    guests?: number;
    attendee_names?: string[] | null;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = (body.slug || '').trim();
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const attending = !!body.attending;
  const guests = Number.isFinite(body.guests as number) ? (body.guests as number) : 0;
  const attendee_names =
    Array.isArray(body.attendee_names) ? body.attendee_names : null;

  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('rsvps')
    .upsert(
      {
        slug,
        attending,
        guests,
        attendee_names,
        // updated_at se actualiza por trigger; si no tienes trigger, descomenta la línea siguiente:
        // updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    .select('slug, attending, guests, attendee_names, updated_at')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rsvp: data });
}
