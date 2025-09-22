// app/i/[slug]/info/page.tsx
import { notFound } from 'next/navigation';
import { getInviteBySlug } from '@/lib/invitesServer';
import { EVENT, TIMEZONE, googleMapsUrl, wazeUrl } from '@/lib/config';
import Countdown from '@/components/Countdown';

export const dynamic = 'force-dynamic';

export default async function InviteInfoPage({
  params,
}: { params: { slug: string } }) {
  const invite = await getInviteBySlug(params.slug);
  if (!invite) return notFound();

  const dateText = new Date(EVENT.eventISO).toLocaleString('es-GT', {
    timeZone: TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Detalles del evento</h1>
      <p className="mt-2">Invitación para: <b>{invite.name}</b></p>
      <p className="mt-1">Cupo asignado: {invite.limit_guests}</p>

      <div className="mt-4 space-y-1">
        <p><b>Fecha:</b> {dateText}</p>
        <Countdown targetISO={EVENT.eventISO} />
        <p><b>Lugar:</b> {EVENT.venue.name}</p>
        <p><b>Dirección:</b> {EVENT.venue.address}</p>
      </div>

      <div className="mt-6 grid gap-3">
        <a className="rounded-xl border px-4 py-2 text-center" href={googleMapsUrl()} target="_blank" rel="noreferrer">
          Abrir en Google Maps
        </a>
        <a className="rounded-xl border px-4 py-2 text-center" href={wazeUrl()} target="_blank" rel="noreferrer">
          Abrir en Waze
        </a>
        <a className="rounded-xl border px-4 py-2 text-center" href={`/i/${invite.slug}/confirm`}>
          Confirmar asistencia
        </a>
      </div>
    </main>
  );
}
