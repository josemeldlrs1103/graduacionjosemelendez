// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Row = {
  slug: string;
  attending: boolean;
  guests: number;
  attendee_names?: string[] | null;
  updated_at?: string;
};

export default function AdminPage({ searchParams }: { searchParams?: { key?: string } }) {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  async function load(withToken: string) {
    setError('');
    setRows(null);
    const res = await fetch('/api/rsvp', {
      headers: { 'x-admin-token': withToken },
      cache: 'no-store',
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || 'Error');
    setRows(j.rsvps || []);
  }

  useEffect(() => {
    // 1) key en URL > 2) localStorage > 3) vacío
    const fromUrl = searchParams?.key || '';
    const saved = !fromUrl ? localStorage.getItem('admin_token') || '' : '';
    const initial = fromUrl || saved || '';
    setToken(initial);
    if (fromUrl) localStorage.setItem('admin_token', fromUrl);

    // si hay token (por URL o guardado), cargamos de una vez
    if (initial) {
      load(initial).catch((e) => setError(e.message || 'Error'));
    }
  }, [searchParams?.key]);

  useEffect(() => {
    if (token) localStorage.setItem('admin_token', token);
  }, [token]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin RSVPs</h1>

      {!token && (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border p-2"
            type="password"
            placeholder="ADMIN_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            onClick={() => token && load(token).catch((e) => setError(e.message || 'Error'))}
            className="rounded-xl border px-4 py-2 hover:shadow"
          >
            Cargar
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {rows && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Slug</th>
                <th className="text-left py-2">Asiste</th>
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Nombres</th>
                <th className="text-left py-2">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-b">
                  <td className="py-2">{r.slug}</td>
                  <td className="py-2">{r.attending ? 'Sí' : 'No'}</td>
                  <td className="py-2">{r.guests}</td>
                  <td className="py-2">
                    {Array.isArray(r.attendee_names) && r.attendee_names.length
                      ? r.attendee_names.join(', ')
                      : '—'}
                  </td>
                  <td className="py-2">
                    {r.updated_at ? new Date(r.updated_at).toLocaleString('es-GT') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
