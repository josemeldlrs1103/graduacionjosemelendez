import Link from 'next/link';
import { listSlugs } from '@/lib/invites';

export default function InviteIndex() {
  const slugs = listSlugs();
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>Invitaciones disponibles</h1>
      <ul>
        {slugs.map((s) => (
          <li key={s}><Link href={`/i/${s}`}>/i/{s}</Link></li>
        ))}
      </ul>
    </main>
  );
}
