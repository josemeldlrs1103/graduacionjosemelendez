// app/i/[slug]/info/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Countdown from '@/components/Countdown';
import { getInvite } from '@/lib/invites';
import { EVENT, googleMapsUrl, wazeUrl } from '@/lib/config';

type Props = { params: { slug: string } };

export default function Info({ params }: Props) {
  const invite = getInvite(params.slug);
  if (!invite) return notFound();

  const gmaps = googleMapsUrl();
  const waze = wazeUrl();

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Información del evento</h1>
      <p style={{ opacity: 0.9 }}>{EVENT.message}</p>

      <div style={{ marginTop: 12 }}>
        <Countdown eventISO={EVENT.eventISO} />
      </div>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20 }}>Lugar</h2>
        <p>
          <strong>{EVENT.venue.name}</strong><br />
          {EVENT.venue.address}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a href={gmaps} target="_blank" rel="noreferrer" style={btn}>Abrir en Google Maps</a>
          <a href={waze} target="_blank" rel="noreferrer" style={btnOutline}>Abrir en Waze</a>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Link href={`/i/${params.slug}/confirmar`} style={btn}>Confirmar asistencia</Link>
        <Link href={`/i/${params.slug}`} style={btnOutline}>Volver</Link>
      </div>
    </main>
  );
}

const btn = { padding: '10px 14px', borderRadius: 10, background: 'black', color: 'white', textDecoration: 'none' };
const btnOutline = { ...btn, background: 'transparent', color: 'black', border: '1px solid black' };
