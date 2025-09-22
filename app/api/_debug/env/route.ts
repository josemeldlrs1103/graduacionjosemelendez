// app/api/_debug/env/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAdmin = !!process.env.ADMIN_TOKEN;

  return new Response(
    JSON.stringify({
      ok: true,
      env: {
        SUPABASE_URL: hasUrl,
        SUPABASE_SERVICE_ROLE_KEY: hasKey,
        ADMIN_TOKEN: hasAdmin,
      },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
