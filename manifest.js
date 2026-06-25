export default function manifest() {
  return {
    name: 'LMS Academy PWA',
    short_name: 'LMS Academy',
    description: 'A Next.js 12-Day Sprint Learning Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}