// app/admin/links/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type InviteRow = {
  slug: string;
  name: string;
  limit_guests: number;
};

export default function AdminLinksPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<InviteRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  // Lee ?key= o localStorage y carga
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('key') || '';
    const saved = !fromUrl ? localStorage.getItem('admin_token') || '' : '';
    const initial = fromUrl || saved || '';
    setToken(initial);
    if (fromUrl) localStorage.setItem('admin_token', fromUrl);

    if (initial) void load(initial);
    else setLoading(false);
  }, []);

  async function load(tok: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/invites', {
        headers: { 'x-admin-token': tok },
        cache: 'no-store',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error al cargar');
      setRows((j.invites || []) as InviteRow[]);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  // Construye URL absoluta para cada slug
  const makeLink = (slug: string) =>
    `${origin || ''}/i/${encodeURIComponent(slug)}`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setError('Enlace copiado ✓');
      setTimeout(() => setError(''), 1200);
    } catch {
      setError('No se pudo copiar el enlace');
    }
  }

  // Botón volver conservando ?key=
  const backHref = useMemo(() => {
    const q = token ? `?key=${encodeURIComponent(token)}` : '';
    return `/admin/home${q}`;
  }, [token]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Enlaces de invitación</h1>
        <p className="mt-2">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Enlaces de invitación</h1>

      {/* Token si no hay (puedes pegarlo y cargar) */}
      {!token && (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border p-2"
            type="password"
            placeholder="ADMIN_TOKEN (pega aquí y presiona Cargar)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            className="rounded-xl border px-4 py-2 hover:shadow"
            onClick={() => token && (localStorage.setItem('admin_token', token), load(token))}
          >
            Cargar
          </button>
        </div>
      )}

      {error && <p className="text-sm">{error}</p>}

      {/* Tabla de enlaces */}
      {rows && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nombre del(los) invitado(s)</th>
                <th className="text-left py-2">Límite</th>
                <th className="text-left py-2">Enlace</th>
                <th className="text-left py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const url = makeLink(r.slug);
                return (
                  <tr key={r.slug} className="border-b align-top">
                    <td className="py-2 pr-2">{r.name}</td>
                    <td className="py-2 pr-2" style={{ width: 120 }}>
                      {r.limit_guests}
                    </td>
                    <td className="py-2 pr-2">
                      <div className="max-w-[320px] truncate">
                        <a
                          className="underline"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={url}
                        >
                          {url}
                        </a>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copy(url)}
                          className="rounded-xl border px-3 py-2 hover:shadow"
                        >
                          Copiar enlace
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Volver al panel */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => { window.location.href = backHref; }}
          className="rounded-xl border px-4 py-2 hover:shadow"
        >
          Volver al panel principal
        </button>
      </div>
    </main>
  );
}
