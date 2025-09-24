// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AdminGate() {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Si ya hay key en URL o en localStorage, intenta validar automáticamente
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('key') || '';
    const saved = !fromUrl ? localStorage.getItem('admin_token') || '' : '';
    const initial = fromUrl || saved || '';
    if (initial) {
      setToken(initial);
      void submit(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(tok?: string) {
    const t = tok ?? token;
    if (!t) return;
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/admin/validate', {
        headers: { 'x-admin-token': t },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Token inválido');
      // guarda localmente y redirige al hub con ?key=
      localStorage.setItem('admin_token', t);
      const url = `/admin/home?key=${encodeURIComponent(t)}`;
      window.location.href = url;
    } catch (e: any) {
      setError(e.message || 'Error validando token');
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      {/* Fondo tenue tipo modal */}
      <div className="fixed inset-0 bg-black/30" />

      {/* Ventana modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold">Acceso de administrador</h1>
        <p className="mt-1 text-sm opacity-80">
          Ingresa tu <code>ADMIN_TOKEN</code> para continuar.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-lg border p-2"
            type="password"
            placeholder="ADMIN_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
          <button
            onClick={() => submit()}
            disabled={!token || checking}
            className="rounded-xl border px-4 py-2 hover:shadow disabled:opacity-50"
          >
            {checking ? 'Verificando…' : 'Entrar'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      </div>
    </main>
  );
}
