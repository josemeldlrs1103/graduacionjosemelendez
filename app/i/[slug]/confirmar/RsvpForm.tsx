'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  slug: string;
  limit: number;
  nameDefault: string;
};

type Rsvp = {
  slug: string;
  name: string | null;
  guests: number;
  attending: boolean;
  note: string | null;
};

export default function RsvpForm({ slug, limit, nameDefault }: Props) {
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState<boolean>(true);
  const [guests, setGuests] = useState<number>(1);
  const [name, setName] = useState<string>(nameDefault ?? '');
  const [note, setNote] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const options = useMemo(() => Array.from({ length: limit }, (_, i) => i + 1), [limit]);

  // Precarga si ya existe un RSVP
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const json = await res.json();
        const r: Rsvp | null = json?.rsvp ?? null;
        if (alive && r) {
          setAttending(!!r.attending);
          setGuests(r.guests ?? 1);
          setName(r.name ?? nameDefault ?? '');
          setNote(r.note ?? '');
        }
      } catch {
        // noop
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug, nameDefault]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Guardando...');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, guests, attending, note }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Error guardando');
      setStatus(attending ? '¡Confirmado! 🎉' : 'Respuesta registrada 🙏');
    } catch (err: any) {
      setStatus(err.message || 'Error');
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm">Nombre</span>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm">¿Asistirás?</span>
        <select
          className="mt-1 w-full rounded-lg border p-2"
          value={attending ? 'yes' : 'no'}
          onChange={(e) => setAttending(e.target.value === 'yes')}
        >
          <option value="yes">Sí</option>
          <option value="no">No</option>
        </select>
      </label>

      {attending && (
        <label className="block">
          <span className="text-sm">Número de invitados</span>
          <select
            className="mt-1 w-full rounded-lg border p-2"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          >
            {options.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="text-sm">Mensaje (opcional)</span>
        <textarea
          className="mt-1 w-full rounded-lg border p-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Alguna nota para los organizadores"
        />
      </label>

      <button type="submit" className="w-full rounded-xl border px-4 py-2 font-medium hover:shadow">
        {attending ? 'Confirmar asistencia' : 'Enviar respuesta'}
      </button>

      {!!status && <p className="text-sm">{status}</p>}
    </form>
  );
}
