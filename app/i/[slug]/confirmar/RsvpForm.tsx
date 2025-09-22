'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  slug: string;
  limit: number;
};

type Rsvp = {
  slug: string;
  guests: number;
  attending: boolean;
};

export default function RsvpForm({ slug, limit }: Props) {
  const [loading, setLoading] = useState(true);

  // Asistencia: sin selección al inicio
  const [attending, setAttending] = useState<'' | 'yes' | 'no'>('');

  // Cantidad de asistentes (solo si attending === 'yes')
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const guestOptions = useMemo(
    () => Array.from({ length: Math.max(1, limit) }, (_, i) => i + 1),
    [limit]
  );

  // Nombres por asistente
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);

  // Estado de envío
  const [status, setStatus] = useState<string>('');

  // Precarga si ya existe RSVP
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const json = await res.json();
        const r: Rsvp | null = json?.rsvp ?? null;
        if (alive && r) {
          setAttending(r.attending ? 'yes' : 'no');
          if (r.attending) {
            setGuestCount(r.guests > 0 ? r.guests : null);
            // inicializa nombres con longitud conocida
            setAttendeeNames(
              Array.from({ length: r.guests > 0 ? r.guests : 1 }, (_, i) => attendeeNames[i] ?? '')
            );
          } else {
            setGuestCount(null);
            setAttendeeNames([]);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Sincroniza el array de nombres cuando cambia la cantidad
  useEffect(() => {
    if (guestCount == null) {
      setAttendeeNames([]);
      return;
    }
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
    setStatus('');

    // Validaciones según nuevo flujo
    if (attending === '') {
      setStatus('Selecciona si asistirás.');
      return;
    }
    if (attending === 'yes' && guestCount == null) {
      setStatus('Selecciona la cantidad de asistentes.');
      return;
    }

    setStatus('Guardando...');

    const payload = {
      slug,
      attending: attending === 'yes',
      guests: attending === 'yes' ? (guestCount as number) : 0,
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
      {/* Radios de asistencia */}
      <fieldset className="space-y-2">
        <legend className="text-sm">¿Asistirás?</legend>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={attending === 'yes'}
              onChange={() => {
                setAttending('yes');
                // no fijamos guestCount aún; el usuario deberá elegirlo
                setGuestCount(null);
              }}
            />
            <span>Sí</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="attending"
              value="no"
              checked={attending === 'no'}
              onChange={() => {
                setAttending('no');
                setGuestCount(null);
                setAttendeeNames([]);
              }}
            />
            <span>No</span>
          </label>
        </div>
      </fieldset>

      {/* Bloque visible solo si "Sí" */}
      {attending === 'yes' && (
        <>
          <div className="mt-2 font-medium">Confirmar asistentes</div>

          {/* Combo de cantidad con placeholder */}
          <label className="block">
            <span className="text-sm">Cantidad</span>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={guestCount ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setGuestCount(v === '' ? null : parseInt(v, 10));
              }}
            >
              <option value="" disabled>
                Elija una respuesta
              </option>
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          {/* Nombres, uno por línea, solo si ya eligieron cantidad */}
          {guestCount != null && (
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
          )}
        </>
      )}

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
