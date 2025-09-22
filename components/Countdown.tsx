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

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function Countdown({ targetISO }: { targetISO: string }) {
  const [t, setT] = useState(() => diff(targetISO));

  useEffect(() => {
    const id = setInterval(() => setT(diff(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (t.done) return <p className="mt-2 text-sm">¡Es hoy! 🎉</p>;

  return (
    <div className="mt-4 flex items-baseline justify-center gap-4 text-center">
      <span className="text-3xl font-semibold tabular-nums">{t.days}</span>
      <span className="text-sm opacity-70">Días</span>

      <span className="text-3xl font-semibold tabular-nums">{pad(t.hours)}</span>
      <span className="text-sm opacity-70">Horas</span>

      <span className="text-3xl font-semibold tabular-nums">{pad(t.minutes)}</span>
      <span className="text-sm opacity-70">Min</span>

      <span className="text-3xl font-semibold tabular-nums">{pad(t.seconds)}</span>
      <span className="text-sm opacity-70">Seg</span>
    </div>
  );
}
