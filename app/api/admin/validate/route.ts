// app/api/admin/validate/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = req.headers.get('x-admin-token') || '';
  const ok = !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
