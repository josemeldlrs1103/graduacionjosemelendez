// app/api/rsvp/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';
import { getInvite } from '../../../lib/invites';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get('slug') || '').trim();

  const invite = getInvite(slug);
  if (!invite) {
    return NextResponse.json({ ok: false, error: 'Invitación inexistente' }, { status: 404 });
  }

  const { data, error } = await supabaseServer
    .from('rsvps')
    .select('guests, updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: 'DB error (GET)' }, { status: 500 });
  }

  const saved = data
    ? { guests: data.guests as number, atISO: new Date(data.updated_at as string).toISOString() }
    : null;

  return NextResponse.json({
    ok: true,
    slug,
    limit: invite.guest_limit,
    saved,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = (body?.slug || '').toString().trim();
    const guests = Number(body?.guests);

    const invite = getInvite(slug);
    if (!invite) {
      return NextResponse.json({ ok: false, error: 'Invitación inexistente' }, { status: 404 });
    }
    if (!Number.isInteger(guests) || guests < 1) {
      return NextResponse.json({ ok: false, error: 'Cantidad inválida' }, { status: 400 });
    }
    if (guests > invite.guest_limit) {
      return NextResponse.json({ ok: false, error: `Máximo permitido: ${invite.guest_limit}` }, { status: 400 });
    }

    const upsert = await supabaseServer
      .from('rsvps')
      .upsert({ slug, guests }, { onConflict: 'slug' })
      .select('guests, updated_at')
      .single();

    if (upsert.error) {
      return NextResponse.json({ ok: false, error: 'DB error (UPSERT)' }, { status: 500 });
    }

    // (Opcional) historial: comenta si no creaste la tabla
    await supabaseServer.from('rsvps_history').insert({ slug, guests });

    return NextResponse.json({
      ok: true,
      saved: {
        guests: upsert.data.guests as number,
        atISO: new Date(upsert.data.updated_at as string).toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error inesperado' }, { status: 500 });
  }
}
