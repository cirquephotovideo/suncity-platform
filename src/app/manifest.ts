import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sun City Paris',
    short_name: 'Sun City',
    description: 'Sauna gay 100% hommes — 3000 m² sur 3 étages — Paris 3ᵉ',
    start_url: '/fr',
    display: 'standalone',
    background_color: '#0E1626',
    theme_color: '#C9A24B',
    icons: [],
  };
}
