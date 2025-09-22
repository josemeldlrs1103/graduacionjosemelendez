// app/debug/env/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DebugEnvPage() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAdmin = !!process.env.ADMIN_TOKEN;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ marginTop: 0 }}>Debug ENV</h1>
      <p>Esta página no muestra los valores, solo si existen en el runtime del deploy.</p>
      <ul style={{ lineHeight: 1.8 }}>
        <li>SUPABASE_URL: <b style={{ color: hasUrl ? 'green' : 'crimson' }}>{String(hasUrl)}</b></li>
        <li>SUPABASE_SERVICE_ROLE_KEY: <b style={{ color: hasKey ? 'green' : 'crimson' }}>{String(hasKey)}</b></li>
        <li>ADMIN_TOKEN: <b style={{ color: hasAdmin ? 'green' : 'crimson' }}>{String(hasAdmin)}</b></li>
      </ul>
      <p style={{ fontSize: 12, color: '#666' }}>
        Si ves <code>false</code> en alguno, agrégalo en Vercel &rarr; Project &rarr; Settings &rarr; Environment Variables
        (en el mismo entorno que estás desplegando: Production/Preview) y vuelve a desplegar.
      </p>
    </main>
  );
}
