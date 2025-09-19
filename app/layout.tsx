export const metadata = { title: 'Invitación' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, Arial' }}>{children}</body>
    </html>
  );
}
