import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FlameStreak',
    short_name: 'FlameStreak',
    description: 'Aplikasi pencatat streak konsistensi Anda',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
