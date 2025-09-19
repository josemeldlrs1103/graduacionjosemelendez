'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ eventISO }: { eventISO: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const target = new Date(eventISO).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setRemaining(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventISO]);

  return <p style={{ fontSize: 18, fontWeight: 600 }}>Faltan: {remaining}</p>;
}
