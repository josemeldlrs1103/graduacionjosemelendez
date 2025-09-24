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

  // token: lee ?key= o localStorage y carga
  useEffect(() => {
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
      setRows((j.rsvps || []) as RsvpRow[]);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  // Separación en dos tablas
  const yesRows = useMemo(
    () => (rows || []).filter(r => !!r.attending),
    [rows]
  );
  const noRows = useMemo(
    () => (rows || []).filter(r => !r.attending),
    [rows]
  );

  // Totales (suma de guests en cada tabla)
  const yesTotal = useMemo(
    () => yesRows.reduce((acc, r) => acc + (r.guests || 0), 0),
    [yesRows]
  );
  const noTotal = useMemo(
    () => noRows.reduce((acc, r) => acc + (r.guests || 0), 0),
    [noRows]
  );

  // Volver al panel conservando ?key=
  const backHref = useMemo(() => {
    const q = token ? `?key=${encodeURIComponent(token)}` : '';
    return `/admin/home${q}`;
  }, [token]);

  // Exportar ambas tablas a PDF (usa print del navegador)
  function exportPdf() {
    const stamp = new Date().toLocaleString('es-GT');
    const fmt = (date?: string | null) =>
      date ? new Date(date).toLocaleString('es-GT') : '—';
    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const yesRowsHtml = yesRows.map(r => `
      <tr>
        <td>${r.guests ?? 0}</td>
        <td>${Array.isArray(r.attendee_names) && r.attendee_names.length ? escape(r.attendee_names.join(', ')) : '—'}</td>
        <td>${fmt(r.updated_at)}</td>
      </tr>
    `).join('');

    const noRowsHtml = noRows.map(r => `
      <tr>
        <td>${r.guests ?? 0}</td>
        <td>${Array.isArray(r.attendee_names) && r.attendee_names.length ? escape(r.attendee_names.join(', ')) : '—'}</td>
        <td>${fmt(r.updated_at)}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>RSVPs — ${stamp}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  h2 { font-size: 16px; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #f7f7f7; }
  .tot { margin: 6px 0 16px; font-weight: 600; }
  @media print {
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
  <h1>Respuestas (exportado ${escape(stamp)})</h1>

  <h2>Asisten (Sí)</h2>
  <div class="tot">Total de personas confirmadas: ${yesTotal}</div>
  <table>
    <thead>
      <tr>
        <th># Confirmados</th>
        <th>Nombres</th>
        <th>Actualizado</th>
      </tr>
    </thead>
    <tbody>
      ${yesRowsHtml || '<tr><td colspan="3" style="text-align:center;opacity:.7">— Sin registros —</td></tr>'}
    </tbody>
  </table>

  <h2>No asisten (No)</h2>
  <div class="tot">Total de personas en “No”: ${noTotal}</div>
  <table>
    <thead>
      <tr>
        <th># Confirmados</th>
        <th>Nombres</th>
        <th>Actualizado</th>
      </tr>
    </thead>
    <tbody>
      ${noRowsHtml || '<tr><td colspan="3" style="text-align:center;opacity:.7">— Sin registros —</td></tr>'}
    </tbody>
  </table>

  <script>window.print();</script>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) {
      alert('Bloqueado por el navegador. Habilita las ventanas emergentes para exportar a PDF.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Respuestas</h1>
        <p className="mt-2">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
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
        <button
          onClick={() => token && load(token)}
          className="rounded-xl border px-3 py-2 hover:shadow text-sm"
          title="Refrescar"
        >
          Refrescar
        </button>
        <button
          onClick={exportPdf}
          className="rounded-xl border px-3 py-2 hover:shadow text-sm"
          title="Exportar PDF"
        >
          Exportar PDF
        </button>
      </div>

      {error && <p className="text-sm">{error}</p>}

      {/* Tabla: Sí asisten */}
      <section>
        <h2 className="text-lg font-semibold">Asisten (Sí)</h2>
        <p className="mb-2">Total de personas confirmadas: <b>{yesTotal}</b></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2"># Confirmados</th>
                <th className="text-left py-2">Nombres</th>
                <th className="text-left py-2">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {yesRows.length ? yesRows.map((r) => (
                <tr key={r.slug} className="border-b align-top">
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
                </tr>
              )) : (
                <tr>
                  <td className="py-6 text-center opacity-70" colSpan={3}>
                    No hay respuestas con “Sí”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabla: No asisten */}
      <section>
        <h2 className="text-lg font-semibold">No asisten (No)</h2>
        <p className="mb-2">Total de personas en “No”: <b>{noTotal}</b></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2"># Confirmados</th>
                <th className="text-left py-2">Nombres</th>
                <th className="text-left py-2">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {noRows.length ? noRows.map((r) => (
                <tr key={r.slug} className="border-b align-top">
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
                </tr>
              )) : (
                <tr>
                  <td className="py-6 text-center opacity-70" colSpan={3}>
                    No hay respuestas con “No”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
