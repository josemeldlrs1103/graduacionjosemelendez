// app/admin/page.tsx
export const runtime = 'nodejs';

import { supabaseServer } from '../../lib/supabaseServer';
import { getInvite } from '../../lib/invites';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const key = (searchParams?.key || '') as string;
  if (!key || key !== process.env.ADMIN_TOKEN) {
    return (
      <main style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
        <h1>401 — No autorizado</h1>
        <p>Usa: <code>/admin?key=TU_TOKEN</code></p>
      </main>
    );
  }

  const { data, error } = await supabaseServer
    .from('rsvps')
    .select('slug, guests, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return (
      <main style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
        <h1>Error al cargar</h1>
        <pre>{String(error.message || error)}</pre>
      </main>
    );
  }

  const rows = (data ?? []).map((r) => {
    const inv = getInvite(r.slug);
    return {
      slug: r.slug,
      name: inv?.name ?? '(slug no encontrado)',
      limit: inv?.guest_limit ?? '—',
      guests: r.guests,
      updated_at: new Date(r.updated_at as string).toLocaleString('es-GT'),
    };
  });

  const totalAsistentes = rows.reduce((acc, r) => acc + Number(r.guests || 0), 0);
  const csvUrl = `/api/admin/export?key=${encodeURIComponent(key)}`;

  return (
    <main style={{ maxWidth: 1080, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Panel de RSVPs</h1>
        <a
          href={csvUrl}
          style={{ padding: '10px 14px', borderRadius: 10, background: 'black', color: 'white', textDecoration: 'none', fontWeight: 600 }}
        >
          Descargar CSV
        </a>
      </header>

      <p style={{ marginTop: 8 }}>
        Registros: <strong>{rows.length}</strong> · Personas confirmadas: <strong>{totalAsistentes}</strong>
      </p>

      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <Th>Slug</Th>
              <Th>Invitado</Th>
              <Th>Cupo</Th>
              <Th>Asistentes</Th>
              <Th>Actualizado</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <Td mono>{r.slug}</Td>
                <Td>{r.name}</Td>
                <Td center>{r.limit}</Td>
                <Td center><strong>{r.guests}</strong></Td>
                <Td>{r.updated_at}</Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <Td colSpan={5} center>Sin datos aún</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #ddd', padding: '10px 8px' }}>{children}</th>;
}

function Td({
  children, center, mono, colSpan,
}: { children: React.ReactNode; center?: boolean; mono?: boolean; colSpan?: number }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '10px 8px',
        borderBottom: '1px solid #eee',
        textAlign: center ? 'center' : 'left',
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </td>
  );
}
