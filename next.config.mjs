// Written by Bearilly Buildgram (full codebase swap). Your previous next.config is saved in .bearilly/archive/.
// If your landing page shows pictures from other websites, copy the "images" setting from the archived file into here.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The sign-up page is gone: new students use the register page. Old sign-up and sign-in addresses still work.
  // Teachers and school admins do not work on this website: their old addresses go to Bearilly's own sign-in page.
  async redirects() {
    return [
      { source: '/signup', destination: '/register', permanent: false },
      { source: '/sign-up', destination: '/register', permanent: false },
      { source: '/sign_up', destination: '/register', permanent: false },
      { source: '/create-account', destination: '/register', permanent: false },
      { source: '/createaccount', destination: '/register', permanent: false },
      { source: '/join', destination: '/register', permanent: false },
      { source: '/signin', destination: '/login', permanent: false },
      { source: '/sign-in', destination: '/login', permanent: false },
      { source: '/sign_in', destination: '/login', permanent: false },
      { source: '/log-in', destination: '/login', permanent: false },
      { source: '/auth/login', destination: '/login', permanent: false },
      { source: '/auth/signin', destination: '/login', permanent: false },
      { source: '/auth/sign-in', destination: '/login', permanent: false },
      { source: '/admin', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/admin/:path*', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/teacher', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/teacher/:path*', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/staff', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/staff/:path*', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/platform', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
      { source: '/platform/:path*', destination: "https://bearilly-v2.vercel.app/login", permanent: false },
    ];
  },
};

export default nextConfig;
