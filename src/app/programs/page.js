'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Programs() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const presenterSectionRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/v1/courses', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const programsData = courses.length > 0 ? courses.map((course, index) => {
    const themes = [
      { accent: 'border-blue-500 text-blue-400', fill: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-amber-500 text-amber-400', fill: 'bg-amber-500', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-emerald-500 text-emerald-400', fill: 'bg-emerald-500', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-purple-500 text-purple-400', fill: 'bg-purple-500', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-pink-500 text-pink-400', fill: 'bg-pink-500', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-red-500 text-red-400', fill: 'bg-red-500', img: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-cyan-500 text-cyan-400', fill: 'bg-cyan-500', img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-indigo-500 text-indigo-400', fill: 'bg-indigo-500', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
      { accent: 'border-teal-500 text-teal-400', fill: 'bg-teal-500', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80' }
    ];
    const theme = themes[index % themes.length];
    
    return {
      id: course.id,
      name: course.title,
      tagline: course.level ? `Professional ${course.level} Track` : 'Advanced Technical Specialization',
      image: theme.img,
      accentColor: theme.accent,
      fillColor: theme.fill,
      overview: course.description || 'Comprehensive curriculum designed for industry-relevant skill acquisition and professional mastery.',
      diplomas: [`Diploma in ${course.title}`, `Advanced ${course.title} Certification`],
      achievements: [
        { label: 'Master Core Competencies', details: 'Acquire deep technical proficiency through project-based learning and expert mentorship.' },
        { label: 'Build Industry Portfolio', details: 'Develop real-world applications and systems vetted by industry professionals.' },
        { label: 'Global Career Readiness', details: 'Transition into high-impact roles with certified technical expertise and practical experience.' }
      ]
    };
  }) : [];

  const handleFooterNavigation = (index) => {
    setActiveTab(index);
    if (presenterSectionRef.current) {
      presenterSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    scrollActiveTabIntoView(index);
  };

  const scrollActiveTabIntoView = (index) => {
    if (scrollContainerRef.current) {
      const tabElement = scrollContainerRef.current.children[index];
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    scrollActiveTabIntoView(index);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRightStagger {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-stagger-1 {
          animation: slideInRightStagger 600ms cubic-bezier(0.16, 1, 0.3, 1) 150ms forwards;
          opacity: 0;
        }
        .animate-stagger-2 {
          animation: slideInRightStagger 600ms cubic-bezier(0.16, 1, 0.3, 1) 300ms forwards;
          opacity: 0;
        }
        .animate-stagger-3 {
          animation: slideInRightStagger 600ms cubic-bezier(0.16, 1, 0.3, 1) 450ms forwards;
          opacity: 0;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

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
          <Link href="/programs" className="hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1 text-black">
            Programs
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors pb-1">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors pb-1">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-black transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-none border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300">
            Get Started
          </Link>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          className="md:hidden p-2 text-black hover:text-red-600 focus:outline-none transition-colors"
          aria-label="Toggle Main Menu Navigation"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-black/95 z-40 flex flex-col border-b border-white/15 animate-slide-up">
          <nav className="flex flex-col space-y-6 p-8 text-lg font-bold uppercase tracking-widest border-b border-white/10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-500 transition-colors">Home</Link>
            <Link href="/programs" onClick={() => setIsMobileMenuOpen(false)} className="text-red-500 transition-colors">Programs</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-500 transition-colors">About</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-500 transition-colors">Contact</Link>
          </nav>
          <div className="p-8 flex flex-col gap-4 mt-auto">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 border border-white/20 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all">Sign In</Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-4 bg-red-600 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">Get Started</Link>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-20 flex flex-col space-y-10 md:space-y-16">
        
        <div className="max-w-2xl text-left space-y-4 animate-slide-up">
          <span className="text-xs font-bold text-red-500 tracking-widest uppercase">OTDS Core Faculties</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">
            Empowering Future <br />
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Digital Leaders</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
            Browse Ornate Tech & Design School’s specialized faculties. Select a faculty tab below to explore current long-term diploma pathways and key learning achievements.
          </p>
        </div>

        {programsData.length > 0 && (
          <>
            <div className="block md:hidden w-full animate-slide-up">
              <label htmlFor="faculty-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Jump to Faculty:
              </label>
              <div className="relative">
                <select
                  id="faculty-select"
                  value={activeTab}
                  onChange={(e) => handleTabChange(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/20 text-white py-3 px-4 rounded-none text-xs font-bold focus:outline-none focus:border-red-500 appearance-none"
                >
                  {programsData.map((prog, index) => (
                    <option key={`opt-${prog.id}`} value={index}>
                      Faculty {index + 1}: {prog.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative w-full z-10 animate-slide-up">
              <div 
                ref={presenterSectionRef}
                role="tablist"
                aria-label="Academic Faculties"
                className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 border-b border-white/10 pb-6 w-full"
              >
                {programsData.map((prog, index) => (
                  <button
                    key={prog.id}
                    id={`tab-${prog.id}`}
                    role="tab"
                    aria-selected={activeTab === index}
                    aria-controls={`panel-${prog.id}`}
                    onClick={() => handleTabChange(index)}
                    className={`text-left p-3 border transition-all duration-300 relative group overflow-hidden ${
                      activeTab === index 
                        ? `${prog.accentColor} bg-white/5 border-white/20` 
                        : 'border-white/10 bg-transparent hover:border-white/30 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <span className="text-[9px] tracking-wider uppercase opacity-60">Faculty 0{index+1}</span>
                      <span className="text-[11px] font-bold leading-tight group-hover:text-white transition-colors line-clamp-2">
                        {prog.name}
                      </span>
                    </div>
                    {activeTab === index && (
                      <div className={`absolute left-0 bottom-0 h-[3px] w-full ${prog.fillColor}`} />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative md:hidden">
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-none pb-4"
                >
                  {programsData.map((prog, index) => (
                    <button
                      key={`mobile-tab-${prog.id}`}
                      onClick={() => handleTabChange(index)}
                      className={`flex-shrink-0 w-44 snap-center text-left p-4 border transition-all duration-300 relative overflow-hidden ${
                        activeTab === index 
                          ? `${prog.accentColor} bg-white/5 border-white/20` 
                          : 'border-white/10 bg-transparent text-slate-400'
                      }`}
                    >
                      <div className="flex flex-col justify-between h-20 space-y-2">
                        <span className="text-[9px] tracking-wider uppercase opacity-60">Faculty 0{index+1}</span>
                        <span className="text-[11px] font-bold leading-tight line-clamp-2">
                          {prog.name}
                        </span>
                      </div>
                      {activeTab === index && (
                        <div className={`absolute left-0 bottom-0 h-[3px] w-full ${prog.fillColor}`} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  <span>← Swipe for more</span>
                  <span>{activeTab + 1} / {programsData.length}</span>
                </div>
              </div>
            </div>

            <div 
              id={`panel-${programsData[activeTab].id}`}
              role="tabpanel"
              aria-labelledby={`tab-${programsData[activeTab].id}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full min-h-[500px]"
            >
              <div className="lg:col-span-5 space-y-6 animate-zoom-in" key={`image-stage-${activeTab}`}>
                <div className="h-[200px] sm:h-[280px] lg:h-[340px] w-full p-1.5 md:p-2 border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden">
                  <div className="relative w-full h-full bg-slate-900/60 overflow-hidden">
                    <img
                      src={programsData[activeTab].image}
                      alt={programsData[activeTab].name}
                      decoding="async"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                      <p className="text-[9px] md:text-[10px] font-bold tracking-widest text-red-500 uppercase">Interactive Course Explorer</p>
                      <h2 className="text-sm md:text-md font-bold uppercase mt-1 leading-tight text-white">{programsData[activeTab].name}</h2>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 bg-white/[0.02] p-4 md:p-6 space-y-3 text-left">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Available Diploma Paths</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {programsData[activeTab].diplomas.map((diploma) => (
                      <div key={diploma} className="flex items-start space-x-2.5 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-none flex-shrink-0 mt-1.5"></span>
                        <span className="leading-snug">{diploma}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col justify-between h-full text-left" key={`content-stage-${activeTab}`}>
                <div className="space-y-3 md:space-y-4 animate-slide-up">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {programsData[activeTab].tagline}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                    {programsData[activeTab].overview}
                  </p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Core Achievements Upon Graduation</span>
                  <div className="space-y-3 md:space-y-4">
                    {programsData[activeTab].achievements.map((ach, aIdx) => {
                      const staggerClass = aIdx === 0 ? 'animate-stagger-1' : aIdx === 1 ? 'animate-stagger-2' : 'animate-stagger-3';
                      return (
                        <div key={ach.label} className={`border border-white/5 bg-white/[0.02] p-4 flex gap-3 md:gap-4 items-start hover:bg-white/[0.04] transition-colors ${staggerClass}`}>
                          <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-none border border-red-500/40 bg-red-500/10 text-red-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-tight leading-snug">{ach.label}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{ach.details}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-slide-up">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <span className="text-xs text-slate-400">Institutional Framework:</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-400">Online & Project-Based Learning</span>
                  </div>
                  <Link href="/signup" className="w-full sm:w-auto text-center rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10">
                    Register For This Faculty
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        <section className="pt-12 md:pt-16 border-t border-white/10 space-y-6 md:space-y-8 text-left animate-slide-up">
          <div className="max-w-lg">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Innovation Playground</span>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase mt-1">Interactive Learning Lab</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Experience our proprietary learning environment. Test your logic, design aesthetics, and technical problem-solving in our simulated production sandbox.
            </p>
          </div>

          <div className="border border-white/10 bg-neutral-900/50 p-4 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-600 to-amber-500 opacity-50"></div>
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ornate_terminal_v2.0.4</span>
            </div>
            <div className="font-mono text-xs md:text-sm space-y-2">
              <p className="text-blue-400">$ ornate init --project "future_leader"</p>
              <p className="text-slate-500">Initializing core curriculum modules...</p>
              <p className="text-emerald-400">✓ Software Engineering Framework Loaded</p>
              <p className="text-emerald-400">✓ AI Optimization Engine Active</p>
              <p className="text-emerald-400">✓ Cybersecurity Perimeter Established</p>
              <p className="text-slate-300 mt-4 animate-pulse">_</p>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="px-6 py-2 border border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Launch Full Sandbox
              </button>
            </div>
          </div>
        </section>

        <section className="pt-12 md:pt-16 border-t border-white/10 space-y-6 md:space-y-8 text-left animate-slide-up">
          <div className="max-w-lg">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Flexible Certification Pathways</span>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase mt-1">Our Program Delivery Models</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Our educational framework operates across distinct timeline structures, custom engineered for both targeted technical competencies and deep-dive professional specializations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-white/10 bg-white/[0.01] p-5 md:p-6 space-y-3">
              <span className="text-xs font-black font-mono text-red-500">LEVEL 01</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Express Certification</h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase">Duration: 2 – 4 Weeks</p>
              <p className="text-xs text-slate-400 leading-relaxed">Ideal for beginners and professionals looking to establish specific technical skills in record time.</p>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-5 md:p-6 space-y-3">
              <span className="text-xs font-black font-mono text-red-500">LEVEL 02</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Professional Certificate</h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase">Duration: 1 – 3 Months</p>
              <p className="text-xs text-slate-400 leading-relaxed">Focuses on rigorous practical assignments, technical assessments, and professional portfolio projects.</p>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-5 md:p-6 space-y-3">
              <span className="text-xs font-black font-mono text-red-500">LEVEL 03</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Advanced Certificate</h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase">Duration: 3 – 6 Months</p>
              <p className="text-xs text-slate-400 leading-relaxed">Emphasizes real-world enterprise projects, collaborative student cohorts, and industry simulation environments.</p>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-5 md:p-6 space-y-3">
              <span className="text-xs font-black font-mono text-red-500">LEVEL 04</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Professional Diploma</h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase">Duration: 6 – 12 Months</p>
              <p className="text-xs text-slate-400 leading-relaxed">Comprehensive curriculum structures featuring comprehensive capstone projects, industry mentorship, and career readiness preparation.</p>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 text-xs py-10 md:py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Ornate Tech & Design School</h4>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Empowering the next generation of digital leaders with industry-grade software, design, cybersecurity, and artificial intelligence curriculum.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Academic Sectors</h4>
            <ul className="space-y-1.5">
              {programsData.slice(0, 4).map((prog, idx) => (
                <li key={prog.id}><button onClick={() => handleFooterNavigation(idx)} className="hover:text-white transition-colors text-left">{prog.name}</button></li>
              ))}
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
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-[10px] md:text-xs">
          &copy; {new Date().getFullYear()} Ornate Tech & Design School. All rights reserved.
        </div>
      </footer>

    </div>
  );
}