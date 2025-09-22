'use client';

import { useEffect, useState } from 'react';

function diff(targetISO: string) {
  const now = Date.now();
  const target = new Date(targetISO).getTime();
  const ms = Math.max(0, target - now);

  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  return { days, hours, minutes, seconds, done: ms === 0 };
}

export default function Countdown({ targetISO }: { targetISO: string }) {
  const [t, setT] = useState(() => diff(targetISO));

  useEffect(() => {
    const id = setInterval(() => setT(diff(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (t.done) return <p className="mt-2 text-sm">¡Es hoy! 🎉</p>;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
      {[
        { label: 'Días', value: t.days },
        { label: 'Horas', value: t.hours },
        { label: 'Min', value: t.minutes },
        { label: 'Seg', value: t.seconds },
      ].map((b) => (
        <div key={b.label} className="rounded-xl border p-3">
          <div className="text-2xl font-semibold tabular-nums">{b.value}</div>
          <div className="text-xs opacity-70">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
