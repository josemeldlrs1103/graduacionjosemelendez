// app/i/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getInviteBySlug } from '@/lib/invitesServer';

export const dynamic = 'force-dynamic'; // siempre fresco (puedes quitarlo luego)

export default async function InviteLanding({
  params,
}: { params: { slug: string } }) {
  const invite = await getInviteBySlug(params.slug);
  if (!invite) return notFound();

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">¡Hola, {invite.name}!</h1>
      <p className="mt-2">Cupo asignado: {invite.limit_guests}</p>

      <div className="mt-6 grid gap-3">
        <a className="rounded-xl border px-4 py-2 text-center" href={`/i/${invite.slug}/info`}>
          Ver detalles
        </a>
        <a className="rounded-xl border px-4 py-2 text-center" href={`/i/${invite.slug}/confirm`}>
          Confirmar asistencia
        </a>
      </div>
    </main>
  );
}
