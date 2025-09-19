import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>Bienvenido</h1>
      <p>Ir a la invitación de prueba: <Link href="/i/8f3k2">/i/8f3k2</Link></p>
    </main>
  );
}
