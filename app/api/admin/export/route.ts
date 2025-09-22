// app/api/admin/export/route.ts
export const runtime = 'nodejs';

import { supabaseServer } from '../../../../lib/supabaseServer';
import { getInvite } from '../../../../lib/invites';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = (searchParams.get('key') || '').trim();
  if (!key || key !== process.env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from('rsvps')
    .select('slug, guests, updated_at')
    .order('updated_at', { ascending: false });

  if (error) return new Response('DB error', { status: 500 });

  const header = ['slug', 'invitado', 'cupo', 'asistentes', 'actualizado_iso'];
  const lines = [header.join(',')];

  for (const row of data ?? []) {
    const inv = getInvite(row.slug);
    const name = (inv?.name ?? '(slug no encontrado)').replaceAll(',', ' ');
    const limit = inv?.guest_limit ?? '';
    const updatedISO = new Date(row.updated_at as string).toISOString();
    lines.push([row.slug, name, String(limit), String(row.guests), updatedISO].join(','));
  }

  const csv = lines.join('\n');
  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="rsvps.csv"`,
      'cache-control': 'no-store',
    },
  });
}
