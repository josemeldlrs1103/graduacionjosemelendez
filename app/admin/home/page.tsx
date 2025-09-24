// app/admin/home/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminHub() {
  const [key, setKey] = useState('');

  // Lee ?key= de la URL o del localStorage (no bloquea la UI si no hay token)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('key') || '';
    const saved = !fromUrl ? localStorage.getItem('admin_token') || '' : '';
    const initial = fromUrl || saved || '';
    setKey(initial);
    if (fromUrl) localStorage.setItem('admin_token', fromUrl);
  }, []);

  const btn = 'block rounded-xl border px-4 py-3 text-center hover:shadow transition';

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Panel de administración</h1>

      {/* Campo para guardar token localmente (opcional) */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border p-2"
          type="password"
          placeholder="ADMIN_TOKEN (opcional)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button
          className="rounded-xl border px-4 py-2 hover:shadow"
          onClick={() => key && localStorage.setItem('admin_token', key)}
          title="Guardar token localmente"
        >
          Guardar token
        </button>
      </div>

      {/* Botones SIEMPRE visibles */}
      <div className="grid gap-3">
        <Link
          className={btn}
          href={`/admin/invites${key ? `?key=${encodeURIComponent(key)}` : ''}`}
          prefetch={false}
        >
          Gestionar Invitados
        </Link>

        <Link
          className={btn}
          href={`/admin/links${key ? `?key=${encodeURIComponent(key)}` : ''}`}
          prefetch={false}
        >
          Mostrar enlaces de invitación
        </Link>

        <Link
          className={btn}
          href={`/admin/respuestas${key ? `?key=${encodeURIComponent(key)}` : ''}`}
          prefetch={false}
        >
          Mostrar respuestas
        </Link>
      </div>

    </main>
  );
}
