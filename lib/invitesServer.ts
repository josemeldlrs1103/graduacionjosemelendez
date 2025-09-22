// lib/invitesServer.ts
import { supabaseAdmin } from './supabaseServer';

export type InviteRow = {
  slug: string;
  name: string;
  limit_guests: number;
};

export async function getInviteBySlug(slug: string): Promise<InviteRow | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('invites')
    .select('slug, name, limit_guests')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}
