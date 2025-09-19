export type Invite = {
  name: string;
  guest_limit: number; // oculto (no va en la URL)
  eventISO: string;    // ISO UTC, ajústalo a tu hora si quieres
  coverImage?: string;
};

// objeto simple (evitamos Map)
const DATA: Record<string, Invite> = {
  '8f3k2': {
    name: 'Invitación de José',
    guest_limit: 2,
    eventISO: '2025-12-31T23:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e'
  }
};

export function getInvite(slug: string) {
  return DATA[slug];
}

export function listSlugs(): string[] {
  return Object.keys(DATA);
}
