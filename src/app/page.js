'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // 1. Core Full-Screen Background Zoom Images (High-availability CDN Fallbacks)
  const backgroundSlideshow = [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80', // Active modern workspace
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80', // Development interface
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80'  // Collaboration environment
  ];

  // 2. Hero Box Interactive Frame Showcase Images
  const heroImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

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
      name: 'School of Software Engineering', 
      desc: 'Build production-grade applications, distributed systems architecture, and scalable cloud-native web layers.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'School of Design', 
      desc: 'Master advanced UI/UX design engineering, atomic system architectures, design thinking frameworks, and interactive web prototypes.',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'School of Artificial Intelligence', 
      desc: 'Deploy deep neural networks, automate machine learning pipelines, and optimize large language model contextual performance.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'School of Cybersecurity', 
      desc: 'Secure enterprise applications, analyze system exploits, and engineer defensive mitigation perimeters for network operations.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
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

          {/* Standard Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1">
              Home
            </Link>
            <Link href="/programs" className="hover:text-blue-600 transition-colors pb-1">
              Programs
            </Link>
            <Link href="/admissions" className="hover:text-blue-600 transition-colors pb-1">
              Admissions
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors pb-1">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors pb-1">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-8">
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-none border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300">
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Showcase Split Layout */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1 w-full">
          <div className="space-y-6 text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              Learn Tech Skills That <br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Build Your Future</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl leading-relaxed font-medium">
              Join Ornate Education. Master critical technological capabilities in Software Engineering, Design, Artificial Intelligence, and Cybersecurity through intense hands-on development.
            </p>
            <div className="pt-2">
              <Link href="/signup" className="inline-block rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10">
                Join Now
              </Link>
            </div>
          </div>

          {/* Secure Interactive Image Slideshow Box */}
          <div className="p-2 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="w-full h-[380px] relative bg-slate-900/40">
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
        <section className="border-y border-white/10 bg-black/40 backdrop-blur-sm py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed max-w-3xl mx-auto">
              Ornate Education is a specialized digital learning platform dedicated to empowering students with industry-relevant technology skills. Our programs combine practical projects, expert guidance, and structured learning paths to prepare students for successful careers in technology.
            </p>
          </div>
        </section>

        {/* Core Faculty Grid System */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-8 w-full">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Our Core Faculties</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faculties.map((fac, idx) => (
              <div key={idx} className="border border-white/10 bg-black/60 backdrop-blur-md group hover:border-white/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl text-white">
                {/* Image wraps with Link to Signup */}
                <Link href="/signup" className="h-52 w-full overflow-hidden border-b border-white/10 relative block">
                  <img 
                    src={fac.image} 
                    alt={fac.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {fac.desc}
                    </p>
                  </div>
                  {/* EXPLORE PATH triggers signup redirect */}
                  <div className="pt-4 border-t border-white/10 flex justify-end items-center">
                    <Link href="/signup" className="text-red-400 text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-300">
                      EXPLORE PATH →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Extended Footer */}
        <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 mt-auto text-xs py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="space-y-3">
              <h4 className="text-white font-bold tracking-wider uppercase text-xs">Ornate Education</h4>
              <p className="text-slate-400 leading-relaxed max-w-xs">
                Empowering the next generation of digital leaders with industry-grade software, design, cybersecurity, and artificial intelligence curriculum.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-xs">Academic Sectors</h4>
              <ul className="space-y-1.5">
                <li><Link href="/programs" className="hover:text-white transition-colors">Software Engineering</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Product UI/UX Design</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Applied AI Engineering</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Defensive Cybersecurity</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-xs">Resources</h4>
              <ul className="space-y-1.5">
                <li><Link href="/admissions" className="hover:text-white transition-colors">Admissions Guidelines</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About our Mission</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Get in touch</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold tracking-wider uppercase text-xs">Sitemap & Legal</h4>
              <ul className="space-y-1.5">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security Disclosures</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center">
            &copy; {new Date().getFullYear()} Ornate Education. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}