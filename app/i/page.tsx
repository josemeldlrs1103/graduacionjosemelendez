// app/i/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function InviteIndexPage() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('invites')
    .select('slug, name, limit_guests')
    .order('name', { ascending: true });

  if (error) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Invitaciones</h1>
        <p className="mt-2 text-red-600">Error cargando: {error.message}</p>
      </main>
    );
  }

  const rows = data || [];

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Invitaciones</h1>
      {!rows.length ? (
        <p className="mt-2 opacity-70">No hay invitados en la base de datos.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.slug} className="rounded-xl border p-3">
              <div className="font-medium">{r.name}</div>
              <div className="text-sm opacity-70">Cupo: {r.limit_guests}</div>
              <a className="text-sm underline" href={`/i/${r.slug}`}>
                Abrir invitación
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
