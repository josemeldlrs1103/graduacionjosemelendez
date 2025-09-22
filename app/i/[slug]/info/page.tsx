// app/i/[slug]/detail/page.tsx
import { notFound } from 'next/navigation';
import { getInviteBySlug } from '@/lib/invitesServer';
import { eventDateText, venueName, googleMapsUrl, wazeUrl } from '@/lib/config';


export const dynamic = 'force-dynamic';

export default async function InviteDetailPage({
  params,
}: { params: { slug: string } }) {
  const invite = await getInviteBySlug(params.slug);
  if (!invite) return notFound();

  const dateText = config?.eventDateText ?? 'Próximamente';
  const venue = config?.venueName ?? 'Lugar del evento';
  const gmaps = config?.googleMapsUrl; // opcional
  const waze = config?.wazeUrl;        // opcional

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Detalles del evento</h1>
      <p className="mt-2">Invitación para: <b>{invite.name}</b></p>
      <p className="mt-1">Cupo asignado: {invite.limit_guests}</p>

      <div className="mt-4 space-y-1">
        <p><b>Fecha:</b> {dateText}</p>
        <p><b>Lugar:</b> {venue}</p>
      </div>

      <div className="mt-6 grid gap-3">
        {gmaps && (
          <a className="rounded-xl border px-4 py-2 text-center" href={gmaps} target="_blank" rel="noreferrer">
            Abrir en Google Maps
          </a>
        )}
        {waze && (
          <a className="rounded-xl border px-4 py-2 text-center" href={waze} target="_blank" rel="noreferrer">
            Abrir en Waze
          </a>
        )}
        <a className="rounded-xl border px-4 py-2 text-center" href={`/i/${invite.slug}/confirm`}>
          Confirmar asistencia
        </a>
      </div>
    </main>
  );
}
