import { notFound } from 'next/navigation';
import Countdown from '@/components/Countdown';
import { getInvite } from '@/lib/invites';

type PageProps = { params: { slug: string } }; // 👈 Next 14: síncrono

export default function InvitePage({ params }: PageProps) {
  const { slug } = params;
  const data = getInvite(slug);
  if (!data) return notFound();

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      {data.coverImage && (
        <div style={{ width: '100%', height: 320, overflow: 'hidden', borderRadius: 16 }}>
          <img
            src={data.coverImage}
            alt="Portada"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      <h1 style={{ marginTop: 24, fontSize: 36, lineHeight: 1.2 }}>{data.name}</h1>
      <div style={{ marginTop: 8, opacity: 0.85 }}>
        <Countdown eventISO={data.eventISO} />
      </div>
    </main>
  );
}
