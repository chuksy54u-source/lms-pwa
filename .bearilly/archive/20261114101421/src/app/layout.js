import { Inter } from 'next/font/google';
import './globals.css';

// Initialize Inter
const sansFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans', // This connects to your Tailwind configuration
});

export const metadata = {
  title: 'Ornate LMS',
  description: 'Learning Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sansFont.variable}`}>
      <body className="bg-[#09090b] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}