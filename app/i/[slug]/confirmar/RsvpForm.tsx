'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  slug: string;
  limit: number;
  nameDefault: string;
};

type Rsvp = {
  slug: string;
  guests: number;
  attending: boolean;
  note: string | null;
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

  // 3) Estado de envío
  const [status, setStatus] = useState<string>('');

  // Precargar si ya existe un RSVP (para conservar conteo y, si existen, nombres en note)
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

          // Intento de leer nombres desde note si vinieran serializados
          let initialNames: string[] | null = null;
          if (r.note && r.note.trim().startsWith('{"attendee_names"')) {
            try {
              const parsed = JSON.parse(r.note);
              if (Array.isArray(parsed?.attendee_names)) {
                initialNames = parsed.attendee_names.map((x: any) => String(x ?? ''));
              }
            } catch {
              // noop
            }
          }
          setAttendeeNames((prev) => {
            const len = Math.max(1, r.guests ?? 1);
            const base = initialNames ?? prev;
            const arr = Array.from({ length: len }, (_, i) => base[i] ?? '');
            return arr;
          });
        }
      } catch {
        // noop
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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

    // Guardamos los nombres dentro de note como JSON (hasta tener una columna propia)
    const note =
      attending === 'yes' && attendeeNames.some((n) => n.trim())
        ? JSON.stringify({ attendee_names: attendeeNames })
        : null;

    const payload = {
      slug,
      attending: attending === 'yes',
      guests: attending === 'yes' ? guestCount : 0,
      note, // puede ir null
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

          {/* Nombres de asistentes: cada uno en su propia línea */}
          <div className="space-y-3">
            {attendeeNames.map((val, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-sm">Nombre de asistente {i + 1}</span>
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
              </div>
            ))}
          </div>
        </>
      ) : null}

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
