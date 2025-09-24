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

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setRows(null);
    try {
      const res = await fetch('/api/rsvp', {
        headers: { 'x-admin-token': token },
        cache: 'no-store',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error');
      setRows(j.rsvps || []);
    } catch (e: any) {
      setError(e.message || 'Error');
    }
  }

  useEffect(() => {
    // Si quieres recordar el token en el navegador:
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem('admin_token', token);
  }, [token]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin RSVPs</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border p-2"
          type="password"
          placeholder="ADMIN_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={load} className="rounded-xl border px-4 py-2 hover:shadow">
          Cargar
        </button>
      </div>

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
                  <td className="py-2">{r.updated_at ? new Date(r.updated_at).toLocaleString('es-GT') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
