'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function About() {
  const [activeTab, setActiveTab] = useState('pillars');
  const [currentYear, setCurrentYear] = useState(2026);

  // Safeguard against Next.js SSR hydration mismatch for the year
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Intersection Observer to trigger slide animations dynamically on scroll (Up & Down)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            // Removing the class allows the animation to re-trigger when scrolling back
            entry.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Slightly offset bottom margin for a better feel
      }
    );

    const cards = document.querySelectorAll('.scroll-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [activeTab]); // Re-run whenever activeTab changes to bind to new tab elements

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* PPT Animation Engine Inject with Scroll triggers */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 
         * SCROLL-TRIGGERED SLIDE TRANSITION RULES
         */
        .scroll-card {
          opacity: 0;
          transform: translateX(-50px);
          /* Fast transition reset when leaving the viewport */
          transition: opacity 300ms ease, transform 300ms ease;
          will-change: transform, opacity;
        }
        
        .scroll-card.in-view {
          opacity: 1;
          transform: translateX(0);
          /* Premium, buttery ease-out transition when entering viewport */
          transition: opacity 850ms cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 850ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--delay, 0ms);
        }
      `}} />

      {/* Consistent Top Header Nav */}
      <header className="border-b border-white/10 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center max-w-7xl mx-auto w-full text-black">
        <div className="flex items-center space-x-3 select-none">
          <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-600 rounded-full rounded-bl-none rotate-45 transform -translate-y-0.5 shadow-sm"></div>
            <div className="absolute w-7 h-7 bg-blue-100 rounded-full border border-black flex items-center justify-center z-10 overflow-hidden">
              <div className="absolute inset-0 border-t border-b border-blue-300/60 my-auto h-3"></div>
              <div className="absolute inset-0 border-l border-r border-blue-300/60 mx-auto w-3 rounded-full"></div>
              <div className="w-2 h-3 bg-slate-600 transform rotate-12 rounded-sm opacity-80"></div>
            </div>
          </div>

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

        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors pb-1">
            Home
          </Link>
          <Link href="/programs" className="hover:text-blue-600 transition-colors pb-1">
            Programs
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1 text-black">
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

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-20">
        
        {/* Section 1: Hero Pitch Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-slide-up">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase">The School Narrative</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
              Designing Creativity.<br />
              Building Technology.<br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Shaping the Future.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Ornate Tech & Design School (OTDS) is a fully online technology and design institution established to bridge the growing digital skills gap by providing practical, industry-relevant, and career-focused education.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/signup" className="rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300">
                Join Our Next Cohort
              </Link>
              <a href="#vision" className="rounded-none border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white/10 transition-all duration-300">
                Explore Our Philosophy
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="border border-white/10 p-2 bg-white/5 backdrop-blur-md">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80" 
                alt="OTDS Innovation Hub" 
                className="w-full h-[350px] object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 hidden md:block border border-black max-w-[240px] text-left">
              <span className="text-3xl font-black block leading-none">50K+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-1 block">Five-Year Student Goal</span>
            </div>
          </div>
        </div>

        <hr className="border-white/10" id="vision" />

        {/* Section 2: Vision & Mission Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className="scroll-card border border-white/10 bg-white/[0.01] p-8 space-y-6 text-left relative overflow-hidden group hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-[0_4px_30px_rgba(59,130,246,0.1)] transition-all duration-500 flex flex-col justify-between"
            style={{ '--delay': '0ms' }}
          >
            <div className="space-y-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <span className="text-xs font-black tracking-widest text-blue-400 uppercase">Strategic Intent</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Our Vision</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                To become Africa's premier online institution for technology, design, and digital innovation education.
              </p>
            </div>
            <div className="h-48 w-full overflow-hidden border border-white/5 mt-4">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80" 
                alt="Our Vision" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <div 
            className="scroll-card border border-white/10 bg-white/[0.01] p-8 space-y-6 text-left relative overflow-hidden group hover:border-red-500/40 hover:-translate-y-1 hover:shadow-[0_4px_30px_rgba(239,68,68,0.1)] transition-all duration-500 flex flex-col justify-between"
            style={{ '--delay': '150ms' }}
          >
            <div className="space-y-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <span className="text-xs font-black tracking-widest text-red-400 uppercase">Operational Purpose</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Our Mission</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                To empower individuals with practical technology and design skills that enable them to secure employment, build businesses, create innovative solutions, and contribute to the global digital economy.
              </p>
            </div>
            <div className="h-48 w-full overflow-hidden border border-white/5 mt-4">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80" 
                alt="Our Mission" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Problem vs. Priority Ecosystem */}
        <section className="space-y-8 text-left">
          <div className="max-w-2xl animate-slide-up">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Educational Reformation</span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Breaking Traditional Barriers</h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mt-2">
              Millions of graduates hold formal certificates yet lack the practical digital skills demanded by today's competitive job market. Here is how we bypass outdated methodologies.
            </p>
          </div>

          {/* Interactive Navigation Elements */}
          <div className="flex border-b border-white/10 animate-slide-up">
            <button 
              onClick={() => setActiveTab('pillars')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 mr-8 transition-colors ${activeTab === 'pillars' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Our Practical Priorities
            </button>
            <button 
              onClick={() => setActiveTab('challenges')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'challenges' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              The Challenges We Solve
            </button>
          </div>

          {activeTab === 'pillars' ? (
            <div key="pillars-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Practical Learning', desc: 'Ditch academic theories; write real programs and develop physical interface mockups starting on day one.', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=80' },
                { title: 'Portfolio Focus', desc: 'Graduate with concrete proof. Every assessment fuels a verifiable creative portfolio that speaks to recruiters.', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80' },
                { title: 'Innovation Ecosystem', desc: 'Build modern solutions, tackle interactive digital modules, and conceptualize creative platforms.', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80' },
                { title: 'Freelancing & Business', desc: 'Acquire high-income remote capabilities structured for entrepreneurship and client delivery frameworks.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80' }
              ].map((pillar, idx) => (
                <div 
                  key={idx} 
                  style={{ '--delay': `${idx * 100}ms` }}
                  className="scroll-card border border-white/10 bg-white/[0.02] p-6 space-y-3 flex flex-col justify-between group hover:border-red-500/30 hover:-translate-y-1.5 hover:shadow-[0_4px_25px_rgba(239,68,68,0.08)] transition-all duration-500"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-red-500">PRIORITY 0{idx+1}</span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{pillar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="h-28 w-full overflow-hidden border border-white/5 mt-4">
                    <img 
                      src={pillar.img} 
                      alt={pillar.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key="challenges-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { issue: 'Graduates Lacking Skills', detail: 'Millions of academic degree holders fail to secure jobs due to lack of standard hands-on experience and training.', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=80' },
                { issue: 'Lack of Project Mentorship', detail: 'Standard online learning programs leave learners isolated without structural system review or professional code critique.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80' },
                { issue: 'Prohibitive Training Costs', detail: 'Standard international technology programs carry financial barriers out of reach for African talents.', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80' }
              ].map((challenge, idx) => (
                <div 
                  key={idx} 
                  style={{ '--delay': `${idx * 100}ms` }}
                  className="scroll-card border border-white/10 bg-white/[0.02] p-6 space-y-3 border-l-2 border-l-amber-500 flex flex-col justify-between group hover:border-amber-500/30 hover:-translate-y-1.5 hover:shadow-[0_4px_25px_rgba(245,158,11,0.08)] transition-all duration-500"
                >
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{challenge.issue}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{challenge.detail}</p>
                  </div>
                  <div className="h-24 w-full overflow-hidden border border-white/5 mt-4">
                    <img 
                      src={challenge.img} 
                      alt={challenge.issue} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Learning Model Timeline */}
        <section className="space-y-8 text-left">
          <div className="max-w-2xl animate-slide-up">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase font-mono">The OTDS Method</span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Our Hybrid Learning Model</h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mt-2">
              We design our digital ecosystem around comprehensive learning structures to guarantee structured accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { type: 'Live Classes', desc: 'Dynamic instructor-led online sessions, collaborative workshops, and direct Q&A forums.', img: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&auto=format&fit=crop&q=80' },
              { type: 'Recorded Learning', desc: 'Self-paced instructional materials, downloadable guidelines, and sandbox development assignments.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80' },
              { type: 'Project-Based Tasks', desc: 'Construct physical portfolios, websites, apps, and artificial intelligence solutions.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80' },
              { type: 'Peer Learning', desc: 'Participate in structured review pools, code critiques, and community collaborative forums.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80' }
            ].map((model, idx) => (
              <div 
                key={idx} 
                style={{ '--delay': `${idx * 100}ms` }}
                className="scroll-card border border-white/5 bg-white/[0.01] p-6 space-y-3 relative group hover:border-blue-500/30 hover:-translate-y-1.5 hover:shadow-[0_4px_25px_rgba(59,130,246,0.08)] transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-white/10 absolute right-4 top-4 group-hover:text-blue-500/10 transition-colors duration-500">0{idx+1}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">{model.type}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{model.desc}</p>
                </div>
                <div className="h-24 w-full overflow-hidden border border-white/5 mt-4">
                  <img 
                    src={model.img} 
                    alt={model.type} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Ornate Core Hubs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div 
            style={{ '--delay': '0ms' }}
            className="scroll-card lg:col-span-6 border border-white/10 bg-gradient-to-br from-blue-900/10 to-transparent p-8 text-left flex flex-col justify-between space-y-6 group hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-[0_4px_30px_rgba(59,130,246,0.1)] transition-all duration-500"
          >
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Product Incubator</span>
              <h3 className="text-2xl font-black text-white uppercase">Ornate Innovation Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A modern virtual center built for deep creative interaction. Work with multidisciplinary teams, participate in specialized school-wide hackathons, complete interface design challenges, and showcase your achievements.
              </p>
            </div>
            <div className="h-40 w-full overflow-hidden border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80" 
                alt="Innovation Hub Grid" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>Build active, production-grade applications.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>Establish client-facing product models.</span>
              </li>
            </ul>
          </div>

          <div 
            style={{ '--delay': '150ms' }}
            className="scroll-card lg:col-span-6 border border-white/10 bg-gradient-to-br from-red-900/10 to-transparent p-8 text-left flex flex-col justify-between space-y-6 group hover:border-red-500/30 hover:-translate-y-1 hover:shadow-[0_4px_30px_rgba(239,68,68,0.1)] transition-all duration-500"
          >
            <div className="space-y-4">
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Career Accelerator</span>
              <h3 className="text-2xl font-black text-white uppercase">Ornate Career Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We bridge active technology careers with dedicated infrastructure. Our platform guides students through professional portfolio refinement, structural mock interviewing, and direct internship pairing.
              </p>
            </div>
            <div className="h-40 w-full overflow-hidden border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop&q=80" 
                alt="Career Guidance Session" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                <span>Comprehensive CV optimization & portfolio audits.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                <span>Freelance system frameworks & remote contract strategies.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Section 6: Five-Year Goals and Milestones */}
        <section className="pt-16 border-t border-white/10 space-y-12 text-left">
          <div className="max-w-2xl animate-slide-up">
            <span className="text-xs font-bold text-amber-500 tracking-widest uppercase">Strategic Vision</span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Our Five-Year Road Map</h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mt-2">
              We are engineering a highly resilient, cross-border digital education ecosystem across the African continent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { stat: '50,000+', label: 'Trained Learners', desc: 'Scale our digital academy pipelines to educate high-performing developers and creative designers.', img: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop&q=80' },
              { stat: 'Pan-African', label: 'Presence', desc: 'Expand core educational infrastructures across multiple target African nations.', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80' },
              { stat: 'Employment', label: 'Direct Graduate Network', desc: 'Secure direct partnership pathways with industry tech firms and global enterprise agencies.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80' },
              { stat: 'Incubator', label: 'Startup Foundation', desc: 'Launch the Ornate Innovation Incubator explicitly configured for seed-funding student platforms.', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop&q=80' }
            ].map((goal, idx) => (
              <div 
                key={idx} 
                style={{ '--delay': `${idx * 100}ms` }}
                className="scroll-card border border-white/10 bg-white/[0.01] p-6 space-y-3 relative overflow-hidden group hover:border-red-500/30 hover:-translate-y-1.5 hover:shadow-[0_4px_25px_rgba(239,68,68,0.08)] transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-0.5 bg-red-500 mb-4 group-hover:w-20 transition-all duration-500" />
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">{goal.stat}</h3>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-tight mt-1">{goal.label}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{goal.desc}</p>
                </div>
                <div className="h-20 w-full overflow-hidden border border-white/5 mt-4">
                  <img 
                    src={goal.img} 
                    alt={goal.label} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Consistent Footer */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 text-xs py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Ornate Tech & Design School</h4>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Empowering the next generation of digital leaders with industry-grade software, design, cybersecurity, and artificial intelligence curriculum.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Academic Sectors</h4>
            <ul className="space-y-1.5">
              <li><Link href="/programs" className="hover:text-white transition-colors text-left">Software Engineering</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors text-left">Product UI/UX Design</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors text-left">Applied AI Engineering</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors text-left">Defensive Cybersecurity</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Resources</h4>
            <ul className="space-y-1.5">
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
          &copy; {currentYear} Ornate Tech & Design School. All rights reserved.
        </div>
      </footer>

    </div>
  );
}