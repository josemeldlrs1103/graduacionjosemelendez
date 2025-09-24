// app/admin/invites/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = {
  slug: string;
  name: string;
  limit_guests: number;
  _dirty?: boolean; // solo para UI
};

export default function AdminInvitesPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form para agregar nuevo
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState<number | ''>('');

  // Lee ?key= o localStorage y carga
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
      const res = await fetch('/api/admin/invites', {
        headers: { 'x-admin-token': tok },
        cache: 'no-store',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error al cargar');
      setRows(
        (j.invites || []).map((r: Row) => ({
          ...r,
          _dirty: false, // limpio al venir del server
        }))
      );
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  // Edición en memoria
  function updateCell(slug: string, patch: Partial<Row>) {
    setRows((prev) =>
      (prev || []).map((r) =>
        r.slug === slug ? { ...r, ...patch, _dirty: true } : r
      )
    );
  }

  // Guardar fila (update por slug) con feedback inmediato
  async function saveRow(row: Row) {
  // token robusto: estado o localStorage
  const tok = token || localStorage.getItem('admin_token') || '';
  if (!tok) return setError('Falta token');

  // Normaliza datos
  const name = (row.name ?? '').trim();
  const limit =
    typeof row.limit_guests === 'number'
      ? row.limit_guests
      : parseInt(String(row.limit_guests || 0), 10);

  if (!name) return setError('El nombre no puede estar vacío');
  if (!Number.isFinite(limit) || limit <= 0) return setError('Límite inválido');

  // ⚠️ Confirmación previa al guardado
  const msg = `¿Guardar cambios para “${name}” (slug: ${row.slug})?
Límite: ${limit}

Se actualizará este registro en la base de datos.`;
  if (!confirm(msg)) return;

  setError('');

  try {
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': tok,
      },
      body: JSON.stringify({
        slug: row.slug,          // update existente por slug
        name,
        limit_guests: limit,
      }),
    });

    const j = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      throw new Error(j?.error || `Error al guardar (HTTP ${res.status})`);
    }

    // Actualiza la fila en memoria con lo que devolvió el servidor
    setRows((prev) =>
      (prev || []).map((r) =>
        r.slug === row.slug
          ? { ...(j.invite ?? { ...row, name, limit_guests: limit }), _dirty: false }
          : r
      )
    );

    // Feedback sutil (puedes cambiar por alert('Guardado ✓') si prefieres popup)
    setError('Guardado ✓');
    setTimeout(() => setError(''), 1200);
  } catch (e: any) {
    setError(e.message || 'Error al guardar');
  }
}


  // Eliminar fila (pide confirmación con nombre/slug/límite)
  async function deleteRow(row: Row) {
    const tok = token || localStorage.getItem('admin_token') || '';
    if (!tok) return setError('Falta token');

    const msg = `¿Eliminar a “${row.name}”?\nInvitados: ${row.limit_guests}\n\nEsta acción quitará su invitación.`;
    if (!confirm(msg)) return;

    try {
      const res = await fetch('/api/admin/invites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': tok,
        },
        body: JSON.stringify({ slug: row.slug }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error al eliminar');
      setRows((prev) => (prev || []).filter((r) => r.slug !== row.slug));
    } catch (e: any) {
      setError(e.message || 'Error al eliminar');
    }
  }

  // Crear nuevo invitado
  async function addNew() {
    setError('');
    const tok = token || localStorage.getItem('admin_token') || '';
    if (!tok) return setError('Falta token');

    const name = newName.trim();
    const limit =
      typeof newLimit === 'number' ? newLimit : parseInt(String(newLimit || 0), 10);

    if (!name) return setError('Ingresa un nombre');
    if (!Number.isFinite(limit) || limit <= 0) return setError('Límite inválido');

    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': tok,
        },
        body: JSON.stringify({ name, limit_guests: limit }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error al crear');

      // inserta ordenado por name
      setRows((prev) => {
        const next = [ ...(prev || []), j.invite as Row ];
        next.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        return next;
      });
      setNewName('');
      setNewLimit('');
      setError('Creado ✓');
      setTimeout(() => setError(''), 1200);
    } catch (e: any) {
      setError(e.message || 'Error al crear');
    }
  }

  // Guardar todos los modificados
  const dirtyRows = useMemo(
    () => (rows || []).filter((r) => r._dirty),
    [rows]
  );

  async function saveAll() {
    const tok = token || localStorage.getItem('admin_token') || '';
    if (!tok) return setError('Falta token');
    for (const r of dirtyRows) {
      // secuencial para simplificar feedback/errores
      // eslint-disable-next-line no-await-in-loop
      await saveRow(r);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Gestionar Invitados</h1>
        <p className="mt-2">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Gestionar Invitados</h1>

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

      {/* Tabla editable */}
      {rows && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nombre del(los) invitado(s)</th>
                <th className="text-left py-2">Límite</th>
                <th className="text-left py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-b align-top">
                  <td className="py-2 pr-2">
                    <input
                      className="w-full rounded-lg border p-2"
                      value={r.name}
                      onChange={(e) => updateCell(r.slug, { name: e.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-2" style={{ width: 120 }}>
                    <input
                      className="w-full rounded-lg border p-2"
                      type="number"
                      min={1}
                      value={r.limit_guests}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateCell(r.slug, {
                          limit_guests: raw === '' ? 1 : parseInt(raw, 10) || 1, // ← nunca NaN
                        });
                      }}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveRow(r)}
                        className="rounded-xl border px-3 py-2 hover:shadow disabled:opacity-50"
                        disabled={!r._dirty}
                        title={r._dirty ? 'Guardar cambios' : 'Sin cambios'}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => deleteRow(r)}
                        className="rounded-xl border px-3 py-2 hover:shadow"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Fila de agregado */}
              <tr className="border-t">
                <td className="py-2 pr-2">
                  <input
                    className="w-full rounded-lg border p-2"
                    placeholder="Nombre del(los) invitado(s)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    min={1}
                    placeholder="Límite"
                    value={newLimit}
                    onChange={(e) =>
                      setNewLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10) || 1)
                    }
                  />
                </td>
                <td className="py-2 pr-2 opacity-60">
                  (...)
                </td>
                <td className="py-2">
                  <button
                    onClick={addNew}
                    className="rounded-xl border px-3 py-2 hover:shadow"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Guardar todos los modificados */}
      {!!dirtyRows.length && (
        <div className="flex justify-end">
          <button
            onClick={saveAll}
            className="rounded-xl border px-4 py-2 hover:shadow"
            title={`${dirtyRows.length} fila(s) con cambios`}
          >
            Guardar {dirtyRows.length} cambio(s)
          </button>
        </div>
      )}

      {/* Botón volver a Home */}
        <div className="flex justify-end mt-6">
        <button
            onClick={() => { window.location.href = '/admin/home'; }}
            className="rounded-xl border px-4 py-2 hover:shadow"
        >
            Volver al panel principal
        </button>
        </div>

    </main>
  );
}
