// app/api/rsvp/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/rsvp?slug=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ rsvp: data ?? null });
}

// POST /api/rsvp
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, guests, attending, attendee_names } = body ?? {};

    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    if (typeof attending !== 'boolean') return NextResponse.json({ error: 'Missing attending (boolean)' }, { status: 400 });
    if (typeof guests !== 'number' || guests < 0) return NextResponse.json({ error: 'Invalid guests' }, { status: 400 });

    // Validación opcional de nombres cuando attending = true
    if (attending) {
      if (!Array.isArray(attendee_names)) {
        return NextResponse.json({ error: 'attendee_names must be an array when attending is true' }, { status: 400 });
      }
      if (attendee_names.length !== guests) {
        return NextResponse.json({ error: 'attendee_names length must match guests' }, { status: 400 });
      }
    }

    const supabase = supabaseAdmin();
    const payload: any = { slug, guests, attending };
    if (attending) payload.attendee_names = attendee_names; // guarda array
    else payload.attendee_names = []; // o null si prefieres

    const { data, error } = await supabase
      .from('rsvps')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, rsvp: data });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

