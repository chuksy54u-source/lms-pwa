'use client';
import { useState } from 'react';
import Link from 'next/link';
// Import the Supabase client initializer matching your utility path
import { createClient } from '@/utils/supabase/client'; 

export default function Contact() {
  // Initialize the Supabase client in-component
  const supabase = createClient();

  const [inquiryType, setInquiryType] = useState('student');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    faculty: 'Software Engineering & Development',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Basic Client-side Validation Guardrails
    if (formData.name.trim().length < 2) {
      setErrorMsg('Please enter a valid full name.');
      setLoading(false);
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMsg('Please provide a slightly more detailed message (minimum 10 characters).');
      setLoading(false);
      return;
    }

    try {
      // Insert the submission directly into your Supabase contact_messages table
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            inquiry_type: inquiryType,
            academic_sector: formData.faculty,
            message: formData.message.trim()
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', faculty: 'Software Engineering & Development', message: '' });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (err) {
      console.error('Error submitting message to Supabase:', err.message);
      setErrorMsg('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* PPT Animation Engine Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
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
      `}} />

      {/* Consistent Top Header Nav */}
      <header className="border-b border-white/10 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 md:px-12 py-4 flex justify-between items-center max-w-7xl mx-auto w-full text-black">
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors pb-1">
            Home
          </Link>
          <Link href="/programs" className="hover:text-blue-600 transition-colors pb-1">
            Programs
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors pb-1">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1 text-black">
            Contact
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-black transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-none border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-black focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-black/10 py-4 px-6 flex flex-col space-y-4 md:hidden shadow-lg z-50">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-blue-600 py-1">
              Home
            </Link>
            <Link href="/programs" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-blue-600 py-1">
              Programs
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-blue-600 py-1">
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-blue-600 border-l-2 border-blue-600 pl-2 py-1">
              Contact
            </Link>
            <hr className="border-slate-200" />
            <div className="flex items-center justify-between pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-slate-600 hover:text-black">
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="rounded-none border-2 border-black bg-black px-5 py-2 text-xs font-bold text-white hover:bg-red-600 hover:border-red-600 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-20 flex flex-col space-y-16 md:space-y-20">
        
        {/* Section 1: Contact Hero Pitch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-slide-up">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] sm:text-xs font-bold text-red-500 tracking-widest uppercase">Global Communications Hub</span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
              Connect With<br />
              Our Faculty.<br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">Start Your Journey.</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Have questions about our certification tracks, professional diplomas, or remote training frameworks? Reach out to our dedicated support networks directly.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <a href="#directory" className="w-full sm:w-auto text-center rounded-none bg-red-600 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white hover:text-black transition-all duration-300">
                View Mail Directory
              </a>
              <a href="#form-section" className="w-full sm:w-auto text-center rounded-none border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white text-xs hover:bg-white/10 transition-all duration-300">
                Send Direct Message
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative group mt-4 lg:mt-0">
            <div className="border border-white/10 p-2 bg-white/5 backdrop-blur-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80" 
                alt="OTDS Admissions Office" 
                loading="lazy"
                className="w-full h-[240px] sm:h-[300px] md:h-[350px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 hidden md:block border border-black max-w-[240px] text-left z-10">
              <span className="text-3xl font-black block leading-none">24/7</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-1 block">Virtual Help Desk Access</span>
            </div>
          </div>
        </div>

        <hr className="border-white/10" id="directory" />

        {/* Section 2: Department Contacts (Visual Cards) */}
        <div className="space-y-8 text-left">
          <div>
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Direct Routing</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">Specialized Portals</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-zoom-in">
            {[
              { 
                title: 'Admissions & Enrollment', 
                email: 'admissions@ornatetechschool.top', 
                desc: 'Inquire about application cycles, tuition payments, and curriculum paths.',
                img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80'
              },
              { 
                title: 'Student Support', 
                email: 'support@ornatetechschool.top', 
                desc: 'Current learners requiring portal technical support, assignment systems, or schedule guides.',
                img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
              },
              { 
                title: 'Corporate Training & Labs', 
                email: 'partnerships@ornatetechschool.top', 
                desc: 'Upskill employees, custom group bootcamps, and direct student-client collaborations.',
                img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80'
              },
              { 
                title: 'Career & Innovation Hub', 
                email: 'hub@ornatetechschool.top', 
                desc: 'Recruiter networks, internship programs, portfolio audits, and startup seed funding.',
                img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&auto=format&fit=crop&q=80'
              }
            ].map((dept, idx) => (
              <div key={idx} className="border border-white/10 bg-white/[0.01] p-5 sm:p-6 space-y-4 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{dept.title}</h3>
                  <a href={`mailto:${dept.email}`} className="text-xs font-bold text-red-500 block hover:underline tracking-tight truncate">{dept.email}</a>
                  <p className="text-xs text-slate-400 leading-relaxed pt-2">{dept.desc}</p>
                </div>
                <div className="h-24 sm:h-28 w-full overflow-hidden border border-white/5 mt-4">
                  <img 
                    src={dept.img} 
                    alt={dept.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Interactive Contact Form & Faculty Finder */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch" id="form-section">
          
          {/* Form Side */}
          <div className="lg:col-span-7 border border-white/10 bg-white/[0.01] p-5 sm:p-8 text-left space-y-6 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div>
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Direct Transmission</span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">Send Us A Message</h3>
            </div>

            {/* Inquiry Selector */}
            <div className="flex border-b border-white/10 space-x-4 sm:space-x-6 pb-2" role="tablist">
              <button 
                type="button"
                role="tab"
                aria-selected={inquiryType === 'student'}
                onClick={() => setInquiryType('student')}
                className={`pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${inquiryType === 'student' ? 'border-red-500 text-white' : 'border-transparent text-slate-400'}`}
              >
                Prospective Student
              </button>
              <button 
                type="button"
                role="tab"
                aria-selected={inquiryType === 'corporate'}
                onClick={() => setInquiryType('corporate')}
                className={`pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${inquiryType === 'corporate' ? 'border-red-500 text-white' : 'border-transparent text-slate-400'}`}
              >
                Corporate / Partner
              </button>
            </div>

            {submitted ? (
              <div className="border border-green-500 bg-green-500/10 p-6 text-center space-y-2 animate-zoom-in" role="alert">
                <span className="text-lg font-bold text-green-400">✓ Message Transmitted</span>
                <p className="text-xs text-slate-300">An Ornate Academy Officer has received your data directly in our secure datastore. We will follow up shortly!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full-name" className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Full Name</label>
                    <input 
                      id="full-name"
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-address" className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Email Address</label>
                    <input 
                      id="email-address"
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="e.g. name@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="academic-sector" className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Primary Academic Sector of Interest</label>
                  <select 
                    id="academic-sector"
                    value={formData.faculty}
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-none px-4 py-3 text-sm sm:text-xs text-slate-300 focus:outline-none focus:border-red-500 transition-colors appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="Software Engineering & Development">Software Engineering & Development</option>
                    <option value="Artificial Intelligence & Emerging Tech">Artificial Intelligence & Emerging Tech</option>
                    <option value="Cybersecurity & Network Technology">Cybersecurity & Network Technology</option>
                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                    <option value="Graphic Design & Visual Communication">Graphic Design & Visual Communication</option>
                    <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                    <option value="Motion Graphics & Digital Media">Motion Graphics & Digital Media</option>
                    <option value="3D Design & Animation">3D Design & Animation</option>
                    <option value="Game Development & Interactive Design">Game Development & Interactive Design</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inquiry-details" className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Inquiry Details</label>
                  <textarea 
                    id="inquiry-details"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm sm:text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder={inquiryType === 'student' ? 'Detail your background level and current training objectives...' : 'Describe your organizational upskilling parameters or partnership goals...'}
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 font-bold mt-2 animate-zoom-in" role="alert">
                    {errorMsg}
                  </p>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-4 hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Transmitting Data...' : 'Submit Inquiry Direct'}
                </button>
              </form>
            )}
          </div>

          {/* Visual Showcase Side */}
          <div className="lg:col-span-5 border border-white/10 bg-gradient-to-br from-blue-900/10 to-transparent p-5 sm:p-8 text-left flex flex-col justify-between space-y-6 group hover:border-blue-500/20 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Our Ecosystem</span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase">A Global, Boundary-Free Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As a fully integrated online school, OTDS bypasses physical learning constraints. Connect with peers, submit live projects, and collaborate inside our online community platforms from any location.
              </p>
            </div>
            <div className="h-[180px] sm:h-[220px] w-full overflow-hidden border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80" 
                alt="OTDS Classroom Engagement" 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Empowering the next 50,000+ technology leaders.
            </p>
          </div>

        </section>

        {/* Section 4: Academic Faculty Hotlines */}
        <section className="space-y-8 text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Departmental Pathways</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">Direct Academic Hotlines</h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mt-2">
              Each school operates independently under specialized leadership. Reach out to specific department coordinators directly via institutional electronic routing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { faculty: 'Software & Data Faculties', path: 'dev.academic@ornatetechschool.top', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=80' },
              { faculty: 'Design & Visual Arts', path: 'creative.academic@ornatetechschool.top', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80' },
              { faculty: 'Emerging Tech & Cybersecurity', path: 'cyber.academic@ornatetechschool.top', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80' }
            ].map((field, idx) => (
              <div key={idx} className="border border-white/5 bg-white/[0.01] p-5 sm:p-6 space-y-4 relative group hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-red-500">FACULTY ROUTE 0{idx+1}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight mt-1">{field.faculty}</h3>
                  <a href={`mailto:${field.path}`} className="text-xs font-mono text-slate-400 block hover:text-white transition-colors mt-1 truncate">{field.path}</a>
                </div>
                <div className="h-24 sm:h-28 w-full overflow-hidden border border-white/5 mt-4">
                  <img 
                    src={field.img} 
                    alt={field.faculty} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Consistent Footer */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-slate-400 text-xs py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
          <div className="space-y-3 col-span-2 md:col-span-1">
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
          <div className="space-y-2 col-span-2 md:col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Sitemap & Legal</h4>
            <ul className="space-y-1.5">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security Disclosures</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center">
          &copy; {new Date().getFullYear()} Ornate Tech & Design School. All rights reserved.
        </div>
      </footer>

    </div>
  );
}