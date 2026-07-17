'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Programs() {
  // 1. Program Achievement Data Deck (Fully aligned with all 9 OTDS Faculty Structures)
  const programsData = [
    {
      id: 'software-engineering',
      name: 'Faculty of Software Engineering & Development',
      tagline: 'Designing Creativity. Building Technology. Shaping the Future.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-blue-500 text-blue-400',
      fillColor: 'bg-blue-500',
      overview: 'Our software engineering tracks bypass outdated theoretical teaching. Students build industry-relevant skillsets by engineering full-stack ecosystems, designing complex databases, and developing mobile applications.',
      diplomas: ['Diploma in Software Engineering', 'Diploma in Full Stack Development', 'Diploma in Mobile Application Development', 'Diploma in Software Quality Assurance'],
      achievements: [
        { label: 'Construct Enterprise Digital Solutions', details: 'Deploy robust web designs, frontend frameworks, backend microservices, and native mobile apps to production.' },
        { label: 'Master API & Modern Database Architectures', details: 'Gain total fluency in Git & GitHub version control, advanced API integration patterns, and enterprise database management.' },
        { label: 'Collaborate in the Ornate Innovation Hub', details: 'Build real-world production systems and participate in school-wide collaborative software hackathons.' }
      ]
    },
    {
      id: 'artificial-intelligence',
      name: 'Faculty of Artificial Intelligence & Emerging Technologies',
      tagline: 'Preparing global leaders for the future of intelligent technologies.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-amber-500 text-amber-400',
      fillColor: 'bg-amber-500',
      overview: 'Acquire high-demand expertise in intelligent automated pipelines. Skip generic calculations to configure model fine-tuning processes, generative prompt systems, and neural optimization engines.',
      diplomas: ['Diploma in Artificial Intelligence', 'Diploma in Machine Learning', 'Diploma in AI Product Development', 'Diploma in Intelligent Automation'],
      achievements: [
        { label: 'Build Production AI Automation Platforms', details: 'Engineer custom model integration systems using cutting-edge prompt engineering frameworks and automated tasks.' },
        { label: 'Design High-Impact Generative Content Pipelines', details: 'Master AI content creation paradigms and configure deep learning models to address market-specific commercial objectives.' },
        { label: 'Pioneer Student Startup Prototypes', details: 'Access the Ornate Innovation Incubator to conceptualize, secure, and build machine learning products.' }
      ]
    },
    {
      id: 'cybersecurity',
      name: 'Faculty of Cybersecurity & Network Technology',
      tagline: 'Building professionals capable of securing critical digital infrastructure.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-emerald-500 text-emerald-400',
      fillColor: 'bg-emerald-500',
      overview: 'Defend organizational computing ecosystems under active simulations. Acquire hands-on proficiency in network configuration, vulnerability scanning, security audits, and penetration protocols.',
      diplomas: ['Diploma in Cybersecurity', 'Diploma in Ethical Hacking', 'Diploma in Information Security', 'Diploma in Network Engineering'],
      achievements: [
        { label: 'Conduct Advanced Penetration Hardening', details: 'Deconstruct structural cybersecurity attacks using real-world testing environments and threat assessment mitigation loops.' },
        { label: 'Administer Global Network Infrastructure', details: 'Implement secure network routing frameworks, data protective perimeters, and advanced server credentials.' },
        { label: 'Achieve Strategic Industry Certifications', details: 'Complete all baseline requirements to transition immediately into defensive or offensive security operations globally.' }
      ]
    },
    {
      id: 'data-science',
      name: 'Faculty of Data Science & Analytics',
      tagline: 'Unlock critical intelligence. Drive structural decision-making.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-purple-500 text-purple-400',
      fillColor: 'bg-purple-500',
      overview: 'Bridge raw logs and high-level corporate planning. Master professional data architectures, write automated extraction scripts, and transform enterprise datasets into visual visualizer pipelines.',
      diplomas: ['Diploma in Data Analytics', 'Diploma in Business Intelligence', 'Diploma in Data Science', 'Diploma in Data Engineering'],
      achievements: [
        { label: 'Query & Structure Big Datasets', details: 'Gain deep proficiency in SQL database extraction, custom query schemas, and algorithmic analytics architectures.' },
        { label: 'Formulate Executive Interactive Dashboards', details: 'Develop fully interactive, real-time enterprise dashboards using Power BI and advanced Excel structures.' },
        { label: 'Design Predictive Analytical Systems', details: 'Formulate structural business intelligence processes and data engineering pipelines built for scale.' }
      ]
    },
    {
      id: 'graphic-design',
      name: 'Faculty of Graphic Design & Visual Communication',
      tagline: 'Creative visual communication, spatial aesthetics, and cohesive branding.',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-pink-500 text-pink-400',
      fillColor: 'bg-pink-500',
      overview: 'Translate strategic concepts into breathtaking visual layout systems. Master modern graphic tools to produce commercial-grade visual assets across digital print media platforms.',
      diplomas: ['Diploma in Graphic Design', 'Diploma in Visual Communication', 'Diploma in Brand Design', 'Diploma in Creative Design'],
      achievements: [
        { label: 'Master Modern Illustration Architectures', details: 'Acquire creative fluency across Adobe Photoshop, Adobe Illustrator, and rapid design tools like Canva.' },
        { label: 'Draft Unified Corporate Brands', details: 'Formulate responsive logo hierarchies, typographic layouts, and social media marketing visual assets.' },
        { label: 'Deliver Complete Print-Ready Collaterals', details: 'Manage dynamic visual campaigns across complex physical packaging layouts and digital editorial templates.' }
      ]
    },
    {
      id: 'uiux-design',
      name: 'Faculty of UI/UX & Product Design',
      tagline: 'Creating exceptional digital human-centered experiences.',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-red-500 text-red-400',
      fillColor: 'bg-red-500',
      overview: 'Focus purely on practical, layout-level user experience framework creation. This faculty guides students through the systemic construction of atomic interface designs and end-to-end product architecture mapping.',
      diplomas: ['Diploma in UI Design', 'Diploma in UX Design', 'Diploma in Product Design', 'Diploma in Human-Centered Design'],
      achievements: [
        { label: 'Architect Complete Figma Blueprints', details: 'Establish advanced proficiency in responsive design systems, interactive wireframing, and user workflow mapping.' },
        { label: 'Formulate Cognitive User Testing Systems', details: 'Plan and execute practical human-centered research projects, interactive prototyping, and system usability logs.' },
        { label: 'Generate Client-Ready Career Portfolios', details: 'Build a fully certified UX product design case-study library vetted by our specialist design mentors.' }
      ]
    },
    {
      id: 'motion-graphics',
      name: 'Faculty of Motion Graphics, Video & Digital Media Design',
      tagline: 'Digital storytelling, composition mechanics, and multimedia production.',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-cyan-500 text-cyan-400',
      fillColor: 'bg-cyan-500',
      overview: 'Inject dynamic physics and storytelling timelines into static assets. Edit cinematic trailers, design seamless motion transitions, and construct high-impact visual effects.',
      diplomas: ['Diploma in Motion Graphics', 'Diploma in Multimedia Design', 'Diploma in Digital Media Design', 'Diploma in Video Production Technology'],
      achievements: [
        { label: 'Direct Professional Non-Linear Video Cuts', details: 'Build industry-grade promotional materials, marketing assets, and social campaigns in Adobe Premiere Pro.' },
        { label: 'Animate Seamless Kinetic Visual Systems', details: 'Build high-fidelity kinetic typography sequences, custom vector transitions, and rich visual effects.' },
        { label: 'Assemble Commercial Multi-Platform Media Assets', details: 'Translate narrative objectives into cohesive video timelines utilizing precise audio engineering.' }
      ]
    },
    {
      id: 'three-d-design',
      name: 'Faculty of 3D Design, Animation & Digital Visualization',
      tagline: 'Immersive virtual assets and advanced 3D architectural spaces.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-indigo-500 text-indigo-400',
      fillColor: 'bg-indigo-500',
      overview: 'Develop complete three-dimensional ecosystems. Program clean spatial topology, configure complex light rendering physics, and execute highly immersive spatial environments.',
      diplomas: ['Diploma in 3D Design', 'Diploma in Animation', 'Diploma in Digital Visualization', 'Diploma in Creative Technology'],
      achievements: [
        { label: 'Master Professional Poly-Modeling & Topology', details: 'Establish seamless workflows within Blender to construct detailed mechanical and complex organic structures.' },
        { label: 'Illuminate Photorealistic Digital Environments', details: 'Set up advanced physical-based rendering (PBR) textures, environmental lighting profiles, and keyframe mechanics.' },
        { label: 'Draft Complex Spatial Walkthroughs', details: 'Animate and present high-fidelity spatial renderings tailored for international architectural agencies.' }
      ]
    },
    {
      id: 'game-development',
      name: 'Faculty of Game Development & Interactive Design',
      tagline: 'Immersive interactive experiences and modern gaming technologies.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-teal-500 text-teal-400',
      fillColor: 'bg-teal-500',
      overview: 'Program scalable physical models and dynamic multiplayer mechanics. Combine technical game coding frameworks with rich graphical components across standard production tools.',
      diplomas: ['Diploma in Game Development', 'Diploma in Interactive Design', 'Diploma in Game Art & Animation'],
      achievements: [
        { label: 'Program High-Performance Interactive Gameplay Loops', details: 'Write solid scripts to orchestrate state, controls, and scene entities inside Unity and Unreal Engine frameworks.' },
        { label: 'Produce Immersive Game Layout Interfaces', details: 'Deconstruct game structures to map interactive canvas elements, HUD overlays, and character systems.' },
        { label: 'Deploy Stable Multi-Platform Builds', details: 'Profile system requirements and distribute interactive releases across mobile, web, and desktop architectures.' }
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const presenterSectionRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Smooth scroll handler to guide user viewport back to active frame upon footer click
  const handleFooterNavigation = (index) => {
    setActiveTab(index);
    if (presenterSectionRef.current) {
      presenterSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Also center slide item in the mobile container on footer selection
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* PPT Animation Engine Inject */}
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
        /* Custom scrollbar hider utility */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Top Header Nav */}
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

        <div className="flex items-center space-x-8">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-black transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-none border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Core Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-20 flex flex-col space-y-10 md:space-y-16">
        
        {/* Pitch Deck Header */}
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

        {/* Mobile Alternate Dropdown Selector */}
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
                  Faculty {index + 1}: {prog.name.replace('Faculty of ', '')}
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

        {/* Controller Bar - Optimized for horizontal swipe with no layout shifting on Mobile */}
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
                    {prog.name.replace('Faculty of ', '')}
                  </span>
                </div>
                {activeTab === index && (
                  <div className={`absolute left-0 bottom-0 h-[3px] w-full ${prog.fillColor}`} />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Swipe Container Version */}
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
                      {prog.name.replace('Faculty of ', '')}
                    </span>
                  </div>
                  {activeTab === index && (
                    <div className={`absolute left-0 bottom-0 h-[3px] w-full ${prog.fillColor}`} />
                  )}
                </button>
              ))}
            </div>
            {/* Visual swipe suggestion helper */}
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <span>← Swipe for more</span>
              <span>{activeTab + 1} / {programsData.length}</span>
            </div>
          </div>
        </div>

        {/* Active Slide Presentation Stage */}
        <div 
          id={`panel-${programsData[activeTab].id}`}
          role="tabpanel"
          aria-labelledby={`tab-${programsData[activeTab].id}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full min-h-[500px]"
        >
          
          {/* Left Column: Dynamic Image and Academic Pathways */}
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

            {/* List of Registered Long-Term Diplomas for this Faculty */}
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

          {/* Right Column: Animated Slide Text and Achievements */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col justify-between h-full text-left" key={`content-stage-${activeTab}`}>
            
            {/* Header Block of Slide */}
            <div className="space-y-3 md:space-y-4 animate-slide-up">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                {programsData[activeTab].tagline}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                {programsData[activeTab].overview}
              </p>
            </div>

            {/* Achievements List */}
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

            {/* Active Action Drawer */}
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

        {/* Program Delivery Model Matrix */}
        <section className="pt-12 md:pt-16 border-t border-white/10 space-y-6 md:space-y-8 text-left animate-slide-up">
          <div className="max-w-lg">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Flexible Certification Pathways</span>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase mt-1">Our Program Delivery Models</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Our educational framework operates across distinct timeline structures, custom engineered for both targeted technical competencies and deep-dive professional specializations.
            </p>
          </div>

          {/* Grid layout adapts seamlessly between phone (1 col), tablet (2 col), and desktop (4 col) */}
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

      {/* Extended Footer */}
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
              <li><button onClick={() => handleFooterNavigation(0)} className="hover:text-white transition-colors text-left">Software Engineering</button></li>
              <li><button onClick={() => handleFooterNavigation(5)} className="hover:text-white transition-colors text-left">Product UI/UX Design</button></li>
              <li><button onClick={() => handleFooterNavigation(1)} className="hover:text-white transition-colors text-left">Applied AI Engineering</button></li>
              <li><button onClick={() => handleFooterNavigation(2)} className="hover:text-white transition-colors text-left">Defensive Cybersecurity</button></li>
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