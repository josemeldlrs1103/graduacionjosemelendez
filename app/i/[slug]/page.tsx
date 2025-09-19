// app/i/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInvite } from '@/lib/invites';

type Props = { params: { slug: string } };

export default function Landing({ params }: Props) {
  const invite = getInvite(params.slug);
  if (!invite) return notFound();

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      {/* portada opcional fija: agrega una <img> si defines EVENT.coverImage */}
      <h1 style={{ marginTop: 8, fontSize: 32 }}>{invite.name}</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>Hasta {invite.guest_limit} personas</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Link href={`/i/${params.slug}/info`} style={btn}>Ver información</Link>
        <Link href={`/i/${params.slug}/confirmar`} style={btnOutline}>Confirmar invitación</Link>
      </div>
    </main>
  );
}

const btn = { padding: '10px 14px', borderRadius: 10, background: 'black', color: 'white', textDecoration: 'none' };
const btnOutline = { ...btn, background: 'transparent', color: 'black', border: '1px solid black' };
