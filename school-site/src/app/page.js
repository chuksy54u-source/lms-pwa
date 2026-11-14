'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // 1. Core Full-Screen Background Zoom Images (High-availability CDN Fallbacks)
  const backgroundSlideshow = [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80', // Active modern workspace
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80', // Development interface
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80' // Collaboration environment
  ];

  // 2. Hero Box Interactive Frame Showcase Images
  const heroImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundSlideshow.length);
    }, 6000); // Transitions background zoom scale every 6 seconds

    const heroTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500); // Changes inside hero box image every 3.5 seconds

    return () => {
      clearInterval(bgTimer);
      clearInterval(heroTimer);
    };
  }, []);

  const faculties = [
    {
      name: 'Faculty of Software Engineering & Development',
      desc: 'Training software developers and digital solution creators. Build production-grade applications, robust architectures, and scalable web layers.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of UI/UX & Product Design',
      desc: 'Creating exceptional digital experiences. Master design thinking frameworks, wireframing, high-fidelity prototyping, and atomic UI systems.',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Artificial Intelligence & Emerging Technologies',
      desc: 'Preparing students for the future of intelligent technologies. Deploy machine learning pipelines, prompt engineering, and generative AI systems.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Cybersecurity & Network Technology',
      desc: 'Building professionals capable of securing digital infrastructure. Analyze system exploits, practice ethical hacking, and secure enterprise assets.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Data Science & Analytics',
      desc: 'Empowering data analysis and business intelligence. Master industry-level SQL, Excel analytics, data visualization, and predictive pipelines.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Graphic Design & Visual Communication',
      desc: 'Crafting creative visual communication and brand systems. Design impactful social, print, and branding systems using Adobe Suite and Canva.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Motion Graphics, Video & Digital Media Design',
      desc: 'Fostering digital storytelling and multimedia production. Learn video editing, motion graphics creation, visual effects, and advanced video workflows.',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of 3D Design, Animation & Digital Visualization',
      desc: 'Stepping into immersive digital creation. Master Blender, architectural and product visualization, and advanced 3D rendering workflows.',
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Faculty of Game Development & Interactive Design',
      desc: 'Designing interactive environments and gaming technology. Build modern games, design immersive experiences, and master Unity and Unreal Engine.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-white selection:bg-red-500/20 antialiased font-sans flex flex-col">
      {/* Cinematic Keyframe Engine inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .animate-zoom {
          animation: subtleZoom 7000ms ease-out forwards;
        }
      `}} />

      {/* 1. BACKGROUND RUNNING SLIDESHOW ENGINE WITH ZOOM */}
      <div className="absolute inset-0 z-0 bg-black">
        {backgroundSlideshow.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out ${
              idx === bgIndex ? 'opacity-100 z-10 animate-zoom' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url('${imgUrl}')` }}
          />
        ))}
        {/* Dark overlay mask to maintain high readability of white text */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] z-20" />
      </div>

      {/* 2. FOREGROUND CONTENT LAYER */}
      <div className="relative z-30 flex flex-col min-h-screen w-full">
        {/* Navigation Header Area */}
        <header className="border-b border-white/10 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center max-w-7xl mx-auto w-full text-black">
          <div className="flex items-center space-x-3 select-none">
            {/* Map Pin Icon Component */}
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-600 rounded-full rounded-bl-none rotate-45 transform -translate-y-0.5 shadow-sm"></div>
              <div className="absolute w-7 h-7 bg-blue-100 rounded-full border border-black flex items-center justify-center z-10 overflow-hidden">
                <div className="absolute inset-0 border-t border-b border-blue-300/60 my-auto h-3"></div>
                <div className="absolute inset-0 border-l border-r border-blue-300/60 mx-auto w-3 rounded-full"></div>
                <div className="w-2 h-3 bg-slate-600 transform rotate-12 rounded-sm opacity-80"></div>
              </div>
            </div>

            {/* Typography Branding Layout */}
            <div className="flex flex-col justify-center relative">
              <div className="flex items-center h-6 relative pr-6">
                <span className="text-xl font-bold tracking-tight text-blue-600 font-sans">
                  o<span className="tracking-wide">rna</span><span className="text-blue-500 font-light">te</span>
                </span>
                <div className="absolute right-3 bottom-0 w-0.5 h-6 bg-black"></div>
                <div className="absolute right-4 bottom-1 w-0.5 h-4 bg-black/60"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-red-500">
                  <div className="absolute right-0 -top-0.5 w-1 h-1.5 border-t border-r border-red-500 rotate-45"></div>
                </div>
              </div>
              <span className="text-[10px] font-serif italic font-bold tracking-wider text-red-600 -mt-0.5 pl-0.5">
                Education
              </span>
            </div>
          </div>

          {/* Standard Navigation Tabs (Desktop Only) */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1">
              Home
            </Link>
            <Link href="/programs" className="hover:text-blue-600 transition-colors pb-1">
              Programs
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors pb-1">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors pb-1">
              Contact
            </Link>
          </nav>

          {/* Call to Actions (Desktop Only) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-none border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300">
              Get Started
            </Link>
          </div>

          {/* Hamburger Icon for Mobile Layouts */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-1 flex flex-col justify-center items-end space-y-1.5 w-8 h-8"
            aria-label="Toggle navigation menu"
          >
            <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-4'}`} />
            <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
          </button>
        </header>

        {/* Mobile Dropdown Menu Container */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-[73px] left-0 right-0 bg-white border-b border-black/10 z-50 flex flex-col px-6 py-6 space-y-4 text-black animate-fade-in shadow-xl">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-wider text-blue-600 border-l-2 border-blue-600 pl-2"
            >
              Home
            </Link>
            <Link 
              href="/programs" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-black pl-2"
            >
              Programs
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-black pl-2"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-black pl-2"
            >
              Contact
            </Link>
            <hr className="border-slate-200 my-1" />
            <div className="flex flex-col space-y-3 pt-2">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-center text-slate-600 hover:text-black py-2.5 border border-slate-300"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-center bg-black text-white py-3 hover:bg-red-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}

        {/* Hero Showcase Split Layout */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-12 md:pt-16 md:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center flex-1 w-full">
          <div className="space-y-5 md:space-y-6 text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
              Designing Creativity.<br />
              Building Technology.<br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Shaping the Future.</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl leading-relaxed font-medium">
              Welcome to Ornate Tech & Design School (OTDS). We bridge the digital skills gap by prioritizing hands-on portfolio development, practical industry projects, and freelancing readiness to empower the next generation of global innovators.
            </p>
            <div className="pt-1 md:pt-2">
              <Link href="/signup" className="inline-block w-full sm:w-auto text-center rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10">
                Explore Programs
              </Link>
            </div>
          </div>

          {/* Secure Interactive Image Slideshow Box */}
          <div className="p-2 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="w-full h-[240px] sm:h-[320px] md:h-[380px] relative bg-slate-900/40">
              {heroImages.map((srcUrl, index) => (
                <img
                  key={index}
                  src={srcUrl}
                  alt={`Hero Frame View ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === heroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Institutional Statement Bar */}
        <section className="border-y border-white/10 bg-black/40 backdrop-blur-sm py-12 md:py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-200 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-3xl mx-auto">
              Ornate Tech & Design School (OTDS) is a premier online technology and design institution established to bridge the growing digital skills gap. Rejecting theory-heavy models, we prioritize real-world projects, expert industry mentorship, and rapid portfolio generation to make you career-ready on day one.
            </p>
          </div>
        </section>

        {/* Core Faculty Grid System */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 space-y-8 w-full">
          <div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase">Our Specialized Faculties</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {faculties.map((fac, idx) => (
              <div key={idx} className="border border-white/10 bg-black/60 backdrop-blur-md group hover:border-white/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl text-white">
                {/* Image wraps with Link to Signup */}
                <Link href="/signup" className="h-48 sm:h-52 w-full overflow-hidden border-b border-white/10 relative block">
                  <img
                    src={fac.image}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-5 md:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors min-h-[40px]">
                      {fac.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {fac.desc}
                    </p>
                  </div>
                  {/* EXPLORE PATH triggers signup redirect */}
                  <div className="pt-4 border-t border-white/10 flex justify-end items-center">
                    <Link href="/signup" className="text-red-400 text-xs font-bold tracking-wider md:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-300">
                      EXPLORE PATH →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Extended Footer */}
        <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 mt-auto text-[11px] sm:text-xs py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="space-y-3">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11px] sm:text-xs">Ornate Tech & Design School</h4>
              <p className="text-slate-400 leading-relaxed max-w-xs">
                To become Africa's premier online institution for technology, design, and digital innovation education by training over 50,000 global digital leaders.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11px] sm:text-xs">Academic Faculties</h4>
              <ul className="space-y-1.5">
                <li><Link href="/programs" className="hover:text-white transition-colors">Software Engineering & Dev</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">UI/UX & Product Design</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">AI & Emerging Tech</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Cybersecurity & Networks</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11px] sm:text-xs">Resources</h4>
              <ul className="space-y-1.5">
                <li><Link href="/about" className="hover:text-white transition-colors">Our Vision & Statement</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Get in touch</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student Hub Login</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11px] sm:text-xs">Sitemap & Legal</h4>
              <ul className="space-y-1.5">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security Disclosures</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center">
            &copy; {new Date().getFullYear()} Ornate Tech & Design School (OTDS). All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}