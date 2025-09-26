// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Invitación',
  description: 'Sitio de invitación',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {/* Fondo suave con degradé */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(80%_80%_at_50%_-20%,#a5b4fc33_0%,transparent_60%)]" />
        {/* Contenido */}
        <div className="container mx-auto max-w-6xl px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
