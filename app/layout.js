import AppProviders from '../components/app/AppProviders';
import '../styles/tokens.css';
import '../styles/app.css';

export const metadata = {
  title: { default: 'Bearilly', template: '%s · Bearilly' },
  description: 'Learn, submit and grow with your AI study buddy.',
  applicationName: 'Bearilly',
  appleWebApp: { capable: true, title: 'Bearilly', statusBarStyle: 'default' },
  icons: { icon: '/bear/exports/head-32.png', apple: '/bear/exports/head-180.png' },
  openGraph: { images: ['/bear/exports/social-1200x630.png'] },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1E3A5F',
};

// Applies the saved light/dark choice before the first paint, so the page never flashes the wrong theme.
const themeScript = `try{var t=JSON.parse(localStorage.getItem('bearilly:theme'));if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);var b=JSON.parse(localStorage.getItem('bearilly:bear-prefs')||'{}');if(b.motion==='reduced'||(b.motion!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches))document.documentElement.setAttribute('data-bear-motion','reduced')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>
        {/* The bear lives inside AppProviders, once, so it stays on every page with the school's tutor settings. */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
