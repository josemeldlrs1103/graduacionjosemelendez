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

type InviteRow = {
  slug: string;
  name: string;
  limit_guests: number;
};

export default function AdminRespuestasPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<RsvpRow[] | null>(null);
  const [invites, setInvites] = useState<InviteRow[] | null>(null);
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

    if (initial) void loadAll(initial);
    else setLoading(false);
  }, []);

  async function loadAll(tok: string) {
    setLoading(true);
    setError('');
    try {
      // Cargar RSVPs
      const [rsvpsRes, invitesRes] = await Promise.all([
        fetch('/api/rsvp', { headers: { 'x-admin-token': tok }, cache: 'no-store' }),
        fetch('/api/admin/invites', { headers: { 'x-admin-token': tok }, cache: 'no-store' }),
      ]);

      const rsvpsJson = await rsvpsRes.json();
      const invitesJson = await invitesRes.json();

      if (!rsvpsRes.ok) throw new Error(rsvpsJson?.error || 'Error rsvps');
      if (!invitesRes.ok) throw new Error(invitesJson?.error || 'Error invites');

      // Normaliza RSVP
      const normalized: RsvpRow[] = (rsvpsJson.rsvps || []).map((r: any) => ({
        slug: String(r.slug),
        attending: r.attending === true,
        guests: Number.isFinite(r.guests) ? r.guests : 0,
        attendee_names: Array.isArray(r.attendee_names)
          ? r.attendee_names
          : typeof r.attendee_names === 'string'
          ? [r.attendee_names]
          : null,
        updated_at: r.updated_at ?? null,
      }));

      setRows(normalized);
      setInvites((invitesJson.invites || []) as InviteRow[]);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
      setRows(null);
      setInvites(null);
    } finally {
      setLoading(false);
    }
  }

  // Map de invites por slug
  const inviteMap = useMemo(() => {
    const m = new Map<string, InviteRow>();
    (invites || []).forEach((i) => m.set(i.slug, i));
    return m;
  }, [invites]);

  // Separación en dos tablas
  const yesRows = useMemo(() => (rows || []).filter((r) => r.attending === true), [rows]);
  const noRows = useMemo(() => (rows || []).filter((r) => r.attending === false), [rows]);

  // Totales
  const yesTotal = useMemo(
    () => yesRows.reduce((acc, r) => acc + (r.guests || 0), 0),
    [yesRows]
  );

  // Para NO: suma de limit_guests desde invites
  const noTotal = useMemo(
    () =>
      noRows.reduce((acc, r) => {
        const inv = inviteMap.get(r.slug);
        return acc + (inv?.limit_guests ?? 0);
      }, 0),
    [noRows, inviteMap]
  );

  // Volver al panel conservando ?key=
  const backHref = useMemo(() => {
    const q = token ? `?key=${encodeURIComponent(token)}` : '';
    return `/admin/home${q}`;
  }, [token]);

  // Exportar ambas tablas a PDF
  function exportPdf() {
    const stamp = new Date().toLocaleString('es-GT');
    const fmt = (date?: string | null) => (date ? new Date(date).toLocaleString('es-GT') : '—');
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const yesRowsHtml = yesRows
      .map((r) => {
        const nombres =
          Array.isArray(r.attendee_names) && r.attendee_names.length
            ? esc(r.attendee_names.join(', '))
            : '—';
        return `
      <tr>
        <td>${r.guests ?? 0}</td>
        <td>${nombres}</td>
        <td>${esc(fmt(r.updated_at))}</td>
      </tr>`;
      })
      .join('');

    const noRowsHtml = noRows
      .map((r) => {
        const inv = inviteMap.get(r.slug);
        const name = esc(inv?.name ?? r.slug);
        const limit = inv?.limit_guests ?? 0;
        return `
      <tr>
        <td>${name}</td>
        <td>${limit}</td>
      </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>RSVPs — ${esc(stamp)}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  h2 { font-size: 16px; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #f7f7f7; }
  .tot { margin: 6px 0 16px; font-weight: 600; }
  @media print { a { color: inherit; text-decoration: none; } }
</style>
</head>
<body>
  <h1>Respuestas (exportado ${esc(stamp)})</h1>

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
        <th>Nombre</th>
        <th>Número de invitados</th>
      </tr>
    </thead>
    <tbody>
      ${noRowsHtml || '<tr><td colspan="2" style="text-align:center;opacity:.7">— Sin registros —</td></tr>'}
    </tbody>
  </table>

  <script>
    window.onload = () => setTimeout(() => window.print(), 50);
  </script>
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
            onClick={() => token && (localStorage.setItem('admin_token', token), loadAll(token))}
          >
            Cargar
          </button>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => token && loadAll(token)}
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
              {yesRows.length ? (
                yesRows.map((r) => (
                  <tr key={r.slug} className="border-b align-top">
                    <td className="py-2 pr-2">{r.guests}</td>
                    <td className="py-2 pr-2">
                      {Array.isArray(r.attendee_names) && r.attendee_names.length
                        ? r.attendee_names.join(', ')
                        : '—'}
                    </td>
                    <td className="py-2 pr-2">
                      {r.updated_at ? new Date(r.updated_at).toLocaleString('es-GT') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
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
                <th className="text-left py-2">Nombre</th>
                <th className="text-left py-2">Número de invitados</th>
              </tr>
            </thead>
            <tbody>
              {noRows.length ? (
                noRows.map((r) => {
                  const inv = inviteMap.get(r.slug);
                  return (
                    <tr key={r.slug} className="border-b align-top">
                      <td className="py-2 pr-2">{inv?.name ?? r.slug}</td>
                      <td className="py-2 pr-2">{inv?.limit_guests ?? 0}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-6 text-center opacity-70" colSpan={2}>
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
          onClick={() => {
            window.location.href = backHref;
          }}
          className="rounded-xl border px-4 py-2 hover:shadow"
        >
          Volver al panel principal
        </button>
      </div>
    </main>
  );
}
