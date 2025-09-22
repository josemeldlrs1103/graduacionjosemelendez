// app/i/[slug]/confirm/page.tsx
import { notFound } from 'next/navigation';
import { getInviteBySlug } from '@/lib/invitesServer';
import RsvpForm from './RsvpForm';

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({ params }: { params: { slug: string } }) {
  const invite = await getInviteBySlug(params.slug);
  if (!invite) return notFound();

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Confirmación</h1>
      <p className="mb-4">Invitado: <b>{invite.name}</b> — Cupo: {invite.limit_guests}</p>
      <RsvpForm slug={invite.slug} limit={invite.limit_guests} nameDefault={invite.name} />
    </main>
  );
}
