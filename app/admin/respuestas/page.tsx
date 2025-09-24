// app/admin/respuestas/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type RsvpRow = {
  slug: string;
  attending: boolean;
  guests: number;
  attendee_names?: string[] | null;
  updated_at?: string | null;
};

export default function AdminRespuestasPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<RsvpRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const [onlyYes, setOnlyYes] = useState(false);

  // token: lee ?key= o localStorage y carga
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
      const res = await fetch('/api/rsvp', {
        headers: { 'x-admin-token': tok },
        cache: 'no-store',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error al cargar');
      // esperamos { rsvps: [...] }
      setRows((j.rsvps || []) as RsvpRow[]);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  // Construye URL a la invitación
  const linkFor = (slug: string) => `${origin || ''}/i/${encodeURIComponent(slug)}`;

  // Datos filtrados
  const data = useMemo(() => {
    const all = rows || [];
    return onlyYes ? all.filter((r) => r.attending) : all;
  }, [rows, onlyYes]);

  // Totales
  const totals = useMemo(() => {
    const all = rows || [];
    const responded = all.length;
    const yes = all.filter((r) => r.attending);
    const yesCount = yes.length;
    const yesGuests = yes.reduce((acc, r) => acc + (r.guests || 0), 0);
    return { responded, yesCount, yesGuests };
  }, [rows]);

  // Exportar CSV
  function exportCsv() {
    const hdr = ['slug', 'asiste', 'invitados', 'nombres', 'actualizado_en'];
    const lines = [hdr.join(',')];
    (rows || []).forEach((r) => {
      const nombres = Array.isArray(r.attendee_names) ? r.attendee_names.join(' | ') : '';
      const cols = [
        r.slug,
        r.attending ? 'SI' : 'NO',
        String(r.guests ?? 0),
        `"${nombres.replace(/"/g, '""')}"`,
        r.updated_at ? new Date(r.updated_at).toISOString() : '',
      ];
      lines.push(cols.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `rsvps-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Copiar enlace
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setError('Enlace copiado ✓');
      setTimeout(() => setError(''), 1200);
    } catch {
      setError('No se pudo copiar el enlace');
    }
  }

  // Volver al panel conservando ?key=
  const backHref = useMemo(() => {
    const q = token ? `?key=${encodeURIComponent(token)}` : '';
    return `/admin/home${q}`;
  }, [token]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Respuestas</h1>
        <p className="mt-2">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Respuestas</h1>

      {/* Token si no hay */}
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

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border px-3 py-2 text-sm">
          Respondieron: <b>{totals.responded}</b> &nbsp;|&nbsp; Sí: <b>{totals.yesCount}</b> &nbsp;|&nbsp; Invitados confirmados: <b>{totals.yesGuests}</b>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyYes}
            onChange={(e) => setOnlyYes(e.target.checked)}
          />
          Mostrar solo “Sí”
        </label>
        <button
          onClick={() => token && load(token)}
          className="rounded-xl border px-3 py-2 hover:shadow text-sm"
          title="Refrescar"
        >
          Refrescar
        </button>
        <button
          onClick={exportCsv}
          className="rounded-xl border px-3 py-2 hover:shadow text-sm"
          title="Exportar CSV"
        >
          Exportar CSV
        </button>
      </div>

      {error && <p className="text-sm">{error}</p>}

      {/* Tabla */}
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Slug</th>
                <th className="text-left py-2">Asiste</th>
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Nombres</th>
                <th className="text-left py-2">Actualizado</th>
                <th className="text-left py-2">Enlace</th>
                <th className="text-left py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const url = linkFor(r.slug);
                return (
                  <tr key={r.slug} className="border-b align-top">
                    <td className="py-2 pr-2"><code>{r.slug}</code></td>
                    <td className="py-2 pr-2">{r.attending ? 'Sí' : 'No'}</td>
                    <td className="py-2 pr-2">{r.guests}</td>
                    <td className="py-2 pr-2">
                      {Array.isArray(r.attendee_names) && r.attendee_names.length
                        ? r.attendee_names.join(', ')
                        : '—'}
                    </td>
                    <td className="py-2 pr-2">
                      {r.updated_at
                        ? new Date(r.updated_at).toLocaleString('es-GT')
                        : '—'}
                    </td>
                    <td className="py-2 pr-2">
                      <div className="max-w-[280px] truncate">
                        <a className="underline" href={url} target="_blank" rel="noopener noreferrer" title={url}>
                          {url}
                        </a>
                      </div>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => copy(url)}
                        className="rounded-xl border px-3 py-2 hover:shadow"
                      >
                        Copiar enlace
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!data.length && (
                <tr>
                  <td className="py-6 text-center opacity-70" colSpan={7}>
                    No hay respuestas aún.
                  </td>
                </tr>
              )}
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
