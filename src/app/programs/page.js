'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Programs() {
  // 1. Program Data Deck
  const programsData = [
    {
      id: 'software-engineering',
      name: 'School of Software Engineering',
      tagline: 'Architecting Scalable enterprise ecosystems.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-blue-500 text-blue-400',
      fillColor: 'bg-blue-500',
      overview: 'Our software engineering tracks bypass outdated paradigms. Students construct hyper-scalable distributed architectures, engineer cloud-native deployments, and master database optimization strategies.',
      curriculum: [
        { phase: '01', title: 'Advanced Full-Stack Engineering', topics: 'Next.js 14 Server Actions, React Concurrent Engine, Node.js Microservices' },
        { phase: '02', title: 'Distributed Systems & Cloud Architecture', topics: 'Docker, Kubernetes Orchestration, AWS Lambda, PostgreSQL Clustering' },
        { phase: '03', title: 'System Designs & CI/CD Pipelines', topics: 'Terraform, GitHub Actions Automation, WebSockets, Redis Caching' }
      ]
    },
    {
      id: 'design',
      name: 'School of Design',
      tagline: 'Designing systemic user experience frameworks.',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-red-500 text-red-400',
      fillColor: 'bg-red-500',
      overview: 'This program redefines digital design. Students focus on systematic design structures, atomic layout assets, human-computer interfaces, interactive prototyping, and rapid usability analytics.',
      curriculum: [
        { phase: '01', title: 'Atomic Design Systems', topics: 'Figma Component Architecture, Responsive Layouts, Tokens & Variables' },
        { phase: '02', title: 'Human Factors & Cognitive Psychology', topics: 'User Behavior Mapping, Usability Auditing, Interactive Prototypes' },
        { phase: '03', title: 'Front-End Design Engineering', topics: 'CSS/Tailwind Architecture, Framer Motion, Creative Coding paradigms' }
      ]
    },
    {
      id: 'artificial-intelligence',
      name: 'School of Artificial Intelligence',
      tagline: 'Deploying neural networks to production pipelines.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-amber-500 text-amber-400',
      fillColor: 'bg-amber-500',
      overview: 'Step beyond basic scripting. This rigorous syllabus targets neural model design, LLM integration pipelines, computer vision systems, and deploying models to enterprise production environments.',
      curriculum: [
        { phase: '01', title: 'Mathematics & Machine Learning Pipelines', topics: 'Linear Algebra, Probability, Pandas, Scikit-Learn pipelines' },
        { phase: '02', title: 'Deep Learning & Neural Networks', topics: 'PyTorch models, Convolutional Networks, Natural Language Processing' },
        { phase: '03', title: 'Generative AI Operations', topics: 'LLM Fine-Tuning, Vector Databases, Retrieval-Augmented Generation (RAG)' }
      ]
    },
    {
      id: 'cybersecurity',
      name: 'School of Cybersecurity',
      tagline: 'Engineering robust mitigation perimeters.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      accentColor: 'border-emerald-500 text-emerald-400',
      fillColor: 'bg-emerald-500',
      overview: 'Defend systems under fire. Learn vulnerability mapping, binary exploits, network analysis, infrastructure hardening, and real-time defensive response operations.',
      curriculum: [
        { phase: '01', title: 'Offensive Systems Engineering', topics: 'Penetration Testing, Exploit Generation, Network Architecture mapping' },
        { phase: '02', title: 'Defensive Security & Detection', topics: 'SIEM Monitoring, Log Forensic Analysis, Network Intrusion mitigation' },
        { phase: '03', title: 'Enterprise Cryptography & DevSecOps', topics: 'Zero-Trust Architectures, SSL/TLS Handshakes, Secure Pipeline hardening' }
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* PPT Animation Engine Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-right {
          animation: slideInRight 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Top Header Nav (Identical to homepage design) */}
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

      {/* Main Core Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-12">
        
        {/* Pitch Deck Header */}
        <div className="max-w-2xl text-left space-y-4 animate-slide-up">
          <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Academic Syllabus Overview</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">
            Examine Our Core <br />
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Syllabus Structures</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
            Toggle through each school card to load the specific technological phases, learning perimeters, and modular curriculums in our interactive pitch deck frame.
          </p>
        </div>

        {/* PowerPoint-style Controller Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-white/10 pb-6 w-full z-10 animate-slide-up">
          {programsData.map((prog, index) => (
            <button
              key={prog.id}
              onClick={() => setActiveTab(index)}
              className={`text-left p-4 border transition-all duration-300 relative group overflow-hidden ${
                activeTab === index 
                  ? `${prog.accentColor} bg-white/5 border-white/20` 
                  : 'border-white/10 bg-transparent hover:border-white/30 text-slate-400'
              }`}
            >
              <div className="flex flex-col justify-between h-full space-y-2">
                <span className="text-[10px] tracking-wider uppercase opacity-60">Phase Segment 0{index+1}</span>
                <span className="text-xs md:text-sm font-bold leading-tight group-hover:text-white transition-colors">{prog.name}</span>
              </div>
              {/* Sliding accent border animation */}
              {activeTab === index && (
                <div className={`absolute left-0 bottom-0 h-[3px] w-full ${prog.fillColor}`} />
              )}
            </button>
          ))}
        </div>

        {/* Active Slide Presentation Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-h-[500px]">
          
          {/* Interactive Frame Box (Left: Dynamic Image) */}
          <div className="lg:col-span-5 h-[320px] lg:h-[480px] w-full p-2 border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden animate-zoom-in">
            <div className="relative w-full h-full bg-slate-900/60 overflow-hidden">
              <img
                src={programsData[activeTab].image}
                alt={programsData[activeTab].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100"
                key={activeTab} // Forces image to rebuild and execute exit/enter frame animations on active tab transition
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] font-bold tracking-widest text-red-500 uppercase">Core Sector Focus</p>
                <h2 className="text-lg font-bold uppercase mt-1 leading-tight text-white">{programsData[activeTab].name}</h2>
              </div>
            </div>
          </div>

          {/* Core Phase Explanations (Right: Interactive Slide Text) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col justify-between h-full text-left" key={programsData[activeTab].id}>
            
            {/* Header Block of Slide */}
            <div className="space-y-4 animate-slide-right">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {programsData[activeTab].tagline}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                {programsData[activeTab].overview}
              </p>
            </div>

            {/* Micro Curriculum Phases (Slideshow style stack) */}
            <div className="space-y-4 animate-slide-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Module Deliverables</span>
              
              <div className="space-y-3">
                {programsData[activeTab].curriculum.map((module, mIdx) => (
                  <div key={mIdx} className="border border-white/5 bg-white/[0.02] p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors">
                    <span className="text-xs font-black font-mono text-red-500">{module.phase}</span>
                    <div className="space-y-1">
                      <h4 className="text-xs md:text-sm font-bold text-white uppercase">{module.title}</h4>
                      <p className="text-xs text-slate-400 leading-normal">{module.topics}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Action Drawer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-right">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Preparation Window:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-green-400">Enrollment Open</span>
              </div>
              <Link href="/signup" className="w-full sm:w-auto text-center rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10">
                Enroll In This School
              </Link>
            </div>

          </div>
        </div>

      </main>

      {/* Extended Footer (Matching Homepage structure exactly) */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 text-xs py-12 px-6">
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
              <li><button onClick={() => setActiveTab(0)} className="hover:text-white transition-colors text-left">Software Engineering</button></li>
              <li><button onClick={() => setActiveTab(1)} className="hover:text-white transition-colors text-left">Product UI/UX Design</button></li>
              <li><button onClick={() => setActiveTab(2)} className="hover:text-white transition-colors text-left">Applied AI Engineering</button></li>
              <li><button onClick={() => setActiveTab(3)} className="hover:text-white transition-colors text-left">Defensive Cybersecurity</button></li>
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
  );
}