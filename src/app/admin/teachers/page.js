'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/teachers?limit=100', {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to load teachers list.');
      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleToggleStatus = async (teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`/api/v1/teachers/${encodeURIComponent(teacher.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update teacher status.');
      
      setTeachers(prev => prev.map(t => t.id === teacher.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <span className="font-black text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Bearilly <span className="text-red-500">Admin</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/teachers" className="text-sm font-medium text-white transition-colors">Teachers</Link>
            <Link href="/admin/students" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Students</Link>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              Add Teacher
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Faculty</h1>
            <p className="text-gray-400 text-xl leading-relaxed">
              Manage your school's educators. Teachers have full access to course creation, student grading, and curriculum development.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
            >
              Import CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
            <p className="text-red-400 text-lg mb-6">{error}</p>
            <button onClick={fetchTeachers} className="bg-white text-black px-8 py-3 rounded-full font-bold">Retry Connection</button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-white/10 rounded-[3rem]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">No teachers registered</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">Start building your faculty by adding your first teacher or importing a list.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 text-white px-10 py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
            >
              Add First Teacher
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="group bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/[0.08] hover:border-white/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-2xl font-black text-red-500">
                    {t.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{t.full_name}</h3>
                    <p className="text-gray-400 font-medium">{t.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        t.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-500/10 border-white/10 text-gray-500'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">Joined {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleStatus(t)}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-sm font-bold transition-all ${
                      t.status === 'active' 
                        ? 'bg-white/5 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {t.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-slide-up">
            <AddTeacherForm 
              onClose={() => setIsAddModalOpen(false)} 
              onAdded={(newTeacher) => {
                setTeachers(prev => [newTeacher, ...prev]);
              }} 
            />
          </div>
        </div>
      )}

      {/* Import Modal Stub */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-slide-up">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-4">Bulk Import</h2>
              <p className="text-gray-400 mb-8">Upload a CSV file containing teacher names and emails.</p>
              {/* TODO: Implement bulk import using Bearilly bulk endpoints if available */}
              <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 mb-8">
                <p className="text-gray-600 font-medium">CSV Import functionality coming soon.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="w-full bg-white text-black py-4 rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Bearilly Academy. Admin Portal.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AddTeacherForm({ onClose, onAdded }) {
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) return;
    
    setBusy(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/teachers', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim()
        })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Could not add teacher. Please check the email address.');
      }
      
      const newTeacher = await response.json();
      setCreated(newTeacher);
      onAdded(newTeacher);
      setFormData({ full_name: '', email: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <div className="text-center py-4">
        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-4">Teacher Created</h2>
        <p className="text-gray-400 mb-10 leading-relaxed">
          Account for <span className="text-white font-bold">{created.full_name}</span> is ready. 
          Provide them with this temporary password. It will not be shown again.
        </p>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-10 group relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mb-4">Temporary Access Key</p>
          <code className="text-4xl font-mono text-red-500 font-black tracking-widest block select-all">
            {created.temporary_password}
          </code>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-lg hover:bg-gray-200 transition-all active:scale-[0.98]"
        >
          Return to List
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Add Faculty</h2>
          <p className="text-gray-500 font-medium">Create a new teacher account instantly.</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Full Legal Name</label>
          <input 
            type="text"
            required
            autoFocus
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-red-500 focus:bg-white/[0.08] transition-all placeholder:text-gray-700"
            placeholder="e.g. Marcus Aurelius"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Institutional Email</label>
          <input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-red-500 focus:bg-white/[0.08] transition-all placeholder:text-gray-700"
            placeholder="marcus@academy.edu"
          />
        </div>
      </div>

      <div className="pt-4">
        <button 
          type="submit"
          disabled={busy}
          className="w-full bg-red-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-red-700 transition-all shadow-2xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Provisioning...
            </span>
          ) : 'Confirm & Create Account'}
        </button>
      </div>
    </form>
  );
}