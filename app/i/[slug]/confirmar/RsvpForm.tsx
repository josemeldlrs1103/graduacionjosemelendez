'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  slug: string;
  limit: number;
  nameDefault: string; // no lo mostramos ya, pero lo mantenemos por compat
};

type Rsvp = {
  slug: string;
  guests: number;
  attending: boolean;
  note: string | null;
  // Si alguna vez guardamos nombres por asistente, los podríamos leer aquí
};

export default function RsvpForm({ slug, limit }: Props) {
  const [loading, setLoading] = useState(true);

  // 1) Asistencia (combo principal)
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');

  // 2) Si “sí”: confirmar asistentes
  const guestOptions = useMemo(
    () => Array.from({ length: Math.max(1, limit) }, (_, i) => i + 1),
    [limit]
  );
  const [guestCount, setGuestCount] = useState<number>(1);
  const [attendeeNames, setAttendeeNames] = useState<string[]>(['']);

  // 3) Nota opcional
  const [note, setNote] = useState<string>('');

  // 4) Estado de envío
  const [status, setStatus] = useState<string>('');

  // Precargar si ya existe un RSVP (solo para mantener “nota” / conteo)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const json = await res.json();
        const r: Rsvp | null = json?.rsvp ?? null;
        if (alive && r) {
          setAttending(r.attending ? 'yes' : 'no');
          setGuestCount(r.guests ?? 1);
          setAttendeeNames((prev) => {
            const len = Math.max(1, r.guests ?? 1);
            const arr = Array.from({ length: len }, (_, i) => prev[i] ?? '');
            return arr;
          });
          setNote(r.note ?? '');
        }
      } catch {
        // noop
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  // Ajusta el array de nombres cuando cambie el número de asistentes
  useEffect(() => {
    setAttendeeNames((prev) => {
      const next = [...prev];
      if (guestCount > next.length) {
        while (next.length < guestCount) next.push('');
      } else if (guestCount < next.length) {
        next.length = guestCount;
      }
      return next;
    });
  }, [guestCount]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Guardando...');

    const payload = {
      slug,
      attending: attending === 'yes',
      guests: attending === 'yes' ? guestCount : 0,
      // En lo que agregamos columna dedicada, serializamos nombres en note (si hay)
      note:
        attending === 'yes'
          ? (attendeeNames.some((n) => n.trim())
              ? `{"attendee_names": ${JSON.stringify(attendeeNames)}}${note ? `\n${note}` : ''}`
              : note)
          : note,
    };

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Error guardando');
      setStatus(attending === 'yes' ? '¡Confirmado! 🎉' : 'Respuesta registrada 🙏');
    } catch (err: any) {
      setStatus(err.message || 'Error');
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Asistencia */}
      <label className="block">
        <span className="text-sm">¿Asistirás?</span>
        <select
          className="mt-1 w-full rounded-lg border p-2"
          value={attending}
          onChange={(e) => setAttending(e.target.value as 'yes' | 'no')}
        >
          <option value="yes">Sí</option>
          <option value="no">No</option>
        </select>
      </label>

      {attending === 'yes' ? (
        <>
          <div className="mt-2 font-medium">Confirmar asistentes</div>

          {/* Número de asistentes */}
          <label className="block">
            <span className="text-sm">Cantidad</span>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
            >
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          {/* Nombres de asistentes */}
          <div className="grid gap-3">
            {attendeeNames.map((val, i) => (
              <label key={i} className="block">
                <span className="text-sm">Nombre del asistente {i + 1}</span>
                <input
                  className="mt-1 w-full rounded-lg border p-2"
                  value={val}
                  onChange={(e) => {
                    const next = [...attendeeNames];
                    next[i] = e.target.value;
                    setAttendeeNames(next);
                  }}
                  placeholder="Nombre y apellido"
                />
              </label>
            ))}
          </div>
        </>
      ) : null}

      {/* Nota opcional (si quieres ocultarla cuando es “no”, puedes moverla dentro del bloque de asistencia) */}
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

      <button
        type="submit"
        className="w-full rounded-xl border px-4 py-2 font-medium hover:shadow"
      >
        {attending === 'yes' ? 'Confirmar asistencia' : 'Enviar respuesta'}
      </button>

      {!!status && <p className="text-sm">{status}</p>}
    </form>
  );
}
