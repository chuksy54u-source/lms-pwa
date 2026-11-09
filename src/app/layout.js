import { Inter } from 'next/font/google';
import './globals.css';

// Initialize Inter
const sansFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Ornate LMS',
  description: 'Learning Management Platform',
};

// Applies the saved light/dark choice before the first paint, so the page never flashes the wrong theme.
const themeScript = `try{var t=JSON.parse(localStorage.getItem('bearilly:theme'));if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);var b=JSON.parse(localStorage.getItem('bearilly:bear-prefs')||'{}');if(b.motion==='reduced'||(b.motion!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches))document.documentElement.setAttribute('data-bear-motion','reduced')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sansFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-[#09090b] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}