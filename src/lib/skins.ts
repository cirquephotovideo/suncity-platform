export type SkinKey = 'sun' | 'v1-acid' | 'v2-techno' | 'v3-y2k' | 'v4-moon';

export interface SkinDef {
  key: SkinKey;
  label: string;
  emoji: string;
  vibe: string;
  /** Route relative à utiliser pour la home (vide = /fr classique) */
  route: string;
  /** Couleurs principales pour preview + accent admin */
  accent: string; // hex
  bg: string;     // hex
  fg: string;     // hex
}

export const SKINS: Record<SkinKey, SkinDef> = {
  'sun': {
    key: 'sun',
    label: 'Sun (classique)',
    emoji: '☀️',
    vibe: 'Or & cuivre, mode sombre, élégant. Notre look principal.',
    route: '',
    accent: '#C9A24B',
    bg: '#0E1626',
    fg: '#F2E8D5',
  },
  'v1-acid': {
    key: 'v1-acid',
    label: 'V1 — Acid Flyer',
    emoji: '⚡',
    vibe: 'Jaune électrique + rouge-orange + noir. Énergie rave flyer.',
    route: '/v1',
    accent: '#FFEE00',
    bg: '#000000',
    fg: '#FFF6E0',
  },
  'v2-techno': {
    key: 'v2-techno',
    label: 'V2 — Techno Brutaliste',
    emoji: '🟢',
    vibe: 'Noir + acid green + mono. Berghain-coded, schémas SVG.',
    route: '/v2',
    accent: '#00FF41',
    bg: '#000000',
    fg: '#00FF41',
  },
  'v3-y2k': {
    key: 'v3-y2k',
    label: 'V3 — Y2K Chrome Cruise',
    emoji: '💿',
    vibe: 'Magenta + cyan + chrome. Frosted glass, blobs, hyper-pop.',
    route: '/v3',
    accent: '#FF006E',
    bg: '#0A0A0A',
    fg: '#FFFFFF',
  },
  'v4-moon': {
    key: 'v4-moon',
    label: 'V4 — Moon Daydream',
    emoji: '🌙',
    vibe: 'Cream + night. Marine Serre, croissants de lune, Fraunces wonky.',
    route: '/v4',
    accent: '#FFE5A0',
    bg: '#FFF6E0',
    fg: '#0F1422',
  },
};

export const SKIN_KEYS = Object.keys(SKINS) as SkinKey[];

export function isValidSkin(s: string | null | undefined): s is SkinKey {
  return !!s && SKIN_KEYS.includes(s as SkinKey);
}

export function getSkin(key: string | null | undefined): SkinDef {
  return isValidSkin(key) ? SKINS[key] : SKINS['sun'];
}
