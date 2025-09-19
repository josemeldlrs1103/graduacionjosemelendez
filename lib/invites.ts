// lib/invites.ts

export type Invite = {
  name: string;        // etiqueta visible
  guest_limit: number; // límite por invitación (no va en la URL)
};

/** Diccionario slug -> invitación (slugs aleatorios de 5 letras, sin números) */
const DATA: Record<string, Invite> = {
  vuniq: { name: 'Marlon Roches & compañía', guest_limit: 2 },
  ralet: { name: 'Fernando & compañía', guest_limit: 2 },
  kimlo: { name: 'Derly Rodas', guest_limit: 4 },
  zefar: { name: 'Pablo Muralles', guest_limit: 2 },
  todex: { name: 'Alexander Villatoro', guest_limit: 1 },
  lamir: { name: 'Brenner Hernández & compañía', guest_limit: 2 },
  poyna: { name: 'Lester Aquino', guest_limit: 1 },
  quste: { name: 'Hector Zetino', guest_limit: 1 },
  mirad: { name: 'Familia Arango Constanza', guest_limit: 3 },
  hobin: { name: 'Nathalia Barrera', guest_limit: 1 },
  sural: { name: 'Familia Hernández Dominguez', guest_limit: 5 },
  tevok: { name: 'Jose Pablo Guillén', guest_limit: 1 },
  wexal: { name: 'Sebastián Fernandez', guest_limit: 1 },
  yonka: { name: 'Evan Zea', guest_limit: 1 },
  pakru: { name: 'Juan Pablo de Leon', guest_limit: 1 },
  jemti: { name: 'José Montenegro', guest_limit: 1 },
  vakor: { name: 'Mario Gómez & compañía', guest_limit: 2 },
  linas: { name: 'Familia Meléndez Mendoza', guest_limit: 4 },
  dretu: { name: 'Familia Melendez Ortiz', guest_limit: 3 },
  moska: { name: 'Andrea Carranza', guest_limit: 1 },
  fenli: { name: 'Michelle Morales & compañía', guest_limit: 2 },
  garon: { name: 'Gabriel Rodriguez', guest_limit: 1 },
  hudek: { name: 'Adonías Vásquez', guest_limit: 1 },
  sibra: { name: 'Sophia Dubon', guest_limit: 1 },
  qolam: { name: 'Kevin Najera', guest_limit: 1 },
  wepir: { name: 'Carlos del Valle', guest_limit: 1 },
  nixad: { name: 'Julio de la Rosa', guest_limit: 1 },
  tobal: { name: 'Gloria Castellanos', guest_limit: 1 },
  rafis: { name: 'Carmen Fajardo', guest_limit: 1 },
  zubem: { name: 'Familia Vásquez De la Rosa', guest_limit: 2 },
  kelra: { name: 'Familia Gómez Callejas', guest_limit: 4 },
};

export function getInvite(slug: string) {
  return DATA[slug];
}

export function listSlugs(): string[] {
  return Object.keys(DATA);
}
