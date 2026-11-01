'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function FeesAdmin() {
  const [activeTab, setActiveTab] = useState('setup');
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchSchool() {
      try {
        const res = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          // Assuming the school context is derived from the authenticated user's session
          setSchool(data.school || { id: 'current' });
        }
      } catch (err) {
        console.error('Failed to fetch school context', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchool();
  }, []);

  const tabs = [
    { id: 'setup', label: 'Payment Account' },
    { id: 'schedules', label: 'Fee Schedules' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Navigation - Preserving school design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:text-red-500 transition-colors">
            BEARILLY<span className="text-red-500">.</span>SCHOOL
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-sm font-medium hover:text-red-500 transition-colors">Programs</Link>
            <Link href="/about" className="text-sm font-medium hover:text-red-500 transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-red-500 transition-colors">Contact</Link>
            <Link href="/admin/fees" className="px-5 py-2 bg-white text-black text-sm font-bold hover:bg-red-500 hover:text-white transition-all duration-300">
              Admin Portal
            </Link>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden">
          <div className="flex flex-col space-y-6 text-2xl font-bold">
            <Link href="/programs" onClick={() => setMobileMenuOpen(false)}>Programs</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/admin/fees" onClick={() => setMobileMenuOpen(false)} className="text-red-500">Admin Portal</Link>
          </div>
        </div>
      )}

      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              SCHOOL <span className="text-red-500 text-stroke">FEES</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl">
              Manage student billing and online payments. Funds are settled directly to your school's connected Paystack account.
            </p>
          </header>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-white/10 pb-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-2 text-sm font-bold transition-all duration-300 ${
                  activeTab === t.id 
                    ? 'bg-white text-black' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            {activeTab === 'setup' && <PaymentAccount schoolId={school?.id} />}
            {activeTab === 'schedules' && <Schedules />}
            {activeTab === 'invoices' && <Invoices />}
            {activeTab === 'payments' && <Payments />}
          </div>
        </div>
      </main>

      <footer className="bg-white/5 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-black tracking-tighter">
            BEARILLY<span className="text-red-500">.</span>SCHOOL
          </div>
          <div className="text-white/40 text-sm">
            © {new Date().getFullYear()} Bearilly School. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .text-stroke {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
    </div>
  );
}

function PaymentAccount({ schoolId }) {
  const [settings, setSettings] = useState(null);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (schoolId) fetchSettings();
  }, [schoolId]);

  async function fetchSettings() {
    try {
      const res = await fetch(`/api/v1/schools/${encodeURIComponent(schoolId)}/payments/settings`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!secret.startsWith('sk_')) {
      setMessage({ type: 'error', text: 'Please enter a valid Paystack secret key.' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/schools/${encodeURIComponent(schoolId)}/payments/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secret.trim() }),
        credentials: 'same-origin'
      });
      if (res.ok) {
        const next = await res.json();
        setSettings(next);
        setSecret('');
        setMessage({ type: 'success', text: 'Paystack account connected successfully.' });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not connect Paystack. Check your key and try again.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect your payment account?')) return;
    try {
      const res = await fetch(`/api/v1/schools/${encodeURIComponent(schoolId)}/payments/settings`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      if (res.ok) {
        setSettings({ configured: false });
        setMessage({ type: 'success', text: 'Account disconnected.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to disconnect account.' });
    }
  }

  if (loading) return <div className="text-white/40">Loading settings...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">PAYSTACK CONFIGURATION</h3>
          {settings?.configured ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              CONNECTED ({settings.mode?.toUpperCase()})
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">
              NOT CONNECTED
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">
              {settings?.configured ? 'Replace Secret Key' : 'Paystack Secret Key'}
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="sk_test_..."
              className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="mt-2 text-xs text-white/40">
              Found in Paystack Dashboard → Settings → API Keys & Webhooks.
            </p>
          </div>

          {message && (
            <div className={`p-4 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={busy}
              className="px-8 py-3 bg-white text-black font-bold hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {busy ? 'SAVING...' : settings?.configured ? 'UPDATE KEY' : 'CONNECT ACCOUNT'}
            </button>
            {settings?.configured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-8 py-3 border border-white/10 text-white font-bold hover:bg-white/5 transition-all duration-300"
              >
                DISCONNECT
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 p-8">
          <h4 className="text-lg font-bold mb-4">HOW IT WORKS</h4>
          <ol className="space-y-4 text-white/60 text-sm list-decimal pl-4">
            <li>Connect your school's Paystack account.</li>
            <li>Create and publish fee schedules for terms or semesters.</li>
            <li>Invoice students directly from the dashboard.</li>
            <li>Students pay via their Bearilly portal; funds go straight to your bank.</li>
          </ol>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 p-8">
          <h4 className="text-lg font-bold mb-2 text-red-500">WEBHOOK SETUP</h4>
          <p className="text-sm text-white/60 mb-4">
            To ensure payments are automatically reconciled, set your Paystack Webhook URL to:
          </p>
          <code className="block bg-black p-3 text-xs text-red-400 border border-red-500/20 break-all">
            {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/school-payments/paystack/webhook
          </code>
        </div>
      </div>
    </div>
  );
}

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      const res = await fetch('/api/v1/school-fees/schedules', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/v1/school-fees/schedules/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'same-origin'
      });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="text-white/40">Loading schedules...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <p className="text-white/40 text-sm max-w-md">
          Define fee structures for specific terms or classes. Drafts can be edited; published schedules are ready for invoicing.
        </p>
        <button 
          onClick={() => { setEditingSchedule(null); setIsFormOpen(true); }}
          className="px-6 py-3 bg-white text-black font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
        >
          NEW SCHEDULE
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white/5 border border-white/10 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold tracking-tight">{s.name.toUpperCase()}</h4>
                <p className="text-xs text-white/40 font-bold tracking-widest mt-1">
                  {s.period_label.toUpperCase()} {s.due_at ? `• DUE ${new Date(s.due_at).toLocaleDateString().toUpperCase()}` : ''}
                </p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-black border ${
                s.status === 'published' ? 'border-emerald-500/40 text-emerald-400' : 'border-white/20 text-white/40'
              }`}>
                {s.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-6 flex-grow">
              {s.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-white/60">{item.name}</span>
                  <span className="font-bold">{(item.amount_minor / 100).toLocaleString()} {s.currency}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-lg font-black">
                <span>TOTAL</span>
                <span className="text-red-500">
                  {(s.items?.reduce((acc, i) => acc + i.amount_minor, 0) / 100).toLocaleString()} {s.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {s.status === 'draft' && (
                <>
                  <button 
                    onClick={() => { setEditingSchedule(s); setIsFormOpen(true); }}
                    className="flex-1 py-2 border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors"
                  >
                    EDIT
                  </button>
                  <button 
                    onClick={() => updateStatus(s.id, 'published')}
                    className="flex-1 py-2 bg-white text-black text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                  >
                    PUBLISH
                  </button>
                </>
              )}
              {s.status === 'published' && (
                <button 
                  onClick={() => updateStatus(s.id, 'archived')}
                  className="flex-1 py-2 border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  ARCHIVE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-black border border-white/10 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ScheduleForm 
              schedule={editingSchedule} 
              onClose={() => setIsFormOpen(false)} 
              onSaved={() => { setIsFormOpen(false); fetchSchedules(); }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleForm({ schedule, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    period_label: schedule?.period_label || '',
    currency: schedule?.currency || 'NGN',
    due_at: schedule?.due_at ? schedule.due_at.split('T')[0] : '',
    items: schedule?.items?.map(i => ({ name: i.name, amount: i.amount_minor / 100 })) || [{ name: 'Tuition', amount: 0 }]
  });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const body = {
      ...formData,
      items: formData.items.map((item, idx) => ({
        ...item,
        amount_minor: Math.round(item.amount * 100),
        position: idx
      }))
    };

    try {
      const url = schedule ? `/api/v1/school-fees/schedules/${schedule.id}` : '/api/v1/school-fees/schedules';
      const method = schedule ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'same-origin'
      });
      if (res.ok) onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { name: '', amount: 0 }] });
  const removeItem = (idx) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, val) => {
    const next = [...formData.items];
    next[idx][field] = val;
    setFormData({ ...formData, items: next });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-black tracking-tighter mb-8">
        {schedule ? 'EDIT' : 'CREATE'} FEE SCHEDULE
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Schedule Name</label>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-red-500 outline-none"
            placeholder="e.g. First Term Fees"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Period</label>
          <input 
            required
            value={formData.period_label}
            onChange={(e) => setFormData({ ...formData, period_label: e.target.value })}
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-red-500 outline-none"
            placeholder="e.g. 2026/2027 Session"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Currency</label>
          <select 
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-red-500 outline-none"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="GHS">GHS</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Due Date</label>
          <input 
            type="date"
            value={formData.due_at}
            onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-red-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Fee Items</label>
        {formData.items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <input 
              required
              value={item.name}
              onChange={(e) => updateItem(idx, 'name', e.target.value)}
              className="flex-grow bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-red-500"
              placeholder="Item name"
            />
            <input 
              required
              type="number"
              value={item.amount}
              onChange={(e) => updateItem(idx, 'amount', parseFloat(e.target.value))}
              className="w-32 bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-red-500"
              placeholder="Amount"
            />
            <button 
              type="button"
              onClick={() => removeItem(idx)}
              className="text-white/40 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        <button 
          type="button"
          onClick={addItem}
          className="text-xs font-bold text-red-500 hover:text-white transition-colors"
        >
          + ADD ITEM
        </button>
      </div>

      <div className="flex gap-4 pt-6">
        <button 
          type="submit"
          disabled={busy}
          className="flex-1 py-4 bg-white text-black font-black hover:bg-red-500 hover:text-white transition-all duration-300"
        >
          {busy ? 'SAVING...' : 'SAVE SCHEDULE'}
        </button>
        <button 
          type="button"
          onClick={onClose}
          className="px-8 py-4 border border-white/10 font-bold hover:bg-white/5 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/school-fees/invoices', { credentials: 'same-origin' }).then(r => r.json()),
      fetch('/api/v1/school-fees/schedules', { credentials: 'same-origin' }).then(r => r.json()),
      fetch('/api/v1/students?limit=100', { credentials: 'same-origin' }).then(r => r.json())
    ]).then(([inv, sch, stu]) => {
      setInvoices(inv);
      setSchedules(sch.filter(s => s.status === 'published'));
      setStudents(stu.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const studentMap = useMemo(() => Object.fromEntries(students.map(s => [s.id, s])), [students]);
  const scheduleMap = useMemo(() => Object.fromEntries(schedules.map(s => [s.id, s])), [schedules]);

  if (loading) return <div className="text-white/40">Loading invoices...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h3 className="text-2xl font-black tracking-tighter">ISSUED INVOICES</h3>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-white text-black font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
        >
          INVOICE STUDENTS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
              <th className="py-4 px-4">Student</th>
              <th className="py-4 px-4">Schedule</th>
              <th className="py-4 px-4">Amount</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Due Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-bold">{studentMap[inv.student_id]?.full_name || 'Unknown Student'}</td>
                <td className="py-4 px-4 text-white/60">{scheduleMap[inv.schedule_id]?.name || '—'}</td>
                <td className="py-4 px-4 font-black text-red-500">
                  {(inv.total_amount_minor / 100).toLocaleString()} {inv.currency}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 text-[10px] font-black border ${
                    inv.status === 'paid' ? 'border-emerald-500/40 text-emerald-400' : 'border-white/20 text-white/40'
                  }`}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-white/40">
                  {inv.due_at ? new Date(inv.due_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-white/20 italic">No invoices issued yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-black border border-white/10 p-8 w-full max-w-xl">
            <InvoiceForm 
              schedules={schedules} 
              students={students} 
              onClose={() => setIsFormOpen(false)}
              onDone={() => {
                setIsFormOpen(false);
                // Refresh invoices
                fetch('/api/v1/school-fees/invoices', { credentials: 'same-origin' })
                  .then(r => r.json())
                  .then(setInvoices);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceForm({ schedules, students, onClose, onDone }) {
  const [selectedSchedule, setSelectedSchedule] = useState(schedules[0]?.id || '');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    if (!selectedSchedule || selectedStudents.length === 0) return;
    setBusy(true);
    try {
      for (const studentId of selectedStudents) {
        await fetch('/api/v1/school-fees/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: selectedSchedule, student_id: studentId }),
          credentials: 'same-origin'
        });
      }
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const toggleStudent = (id) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black tracking-tighter mb-8">INVOICE STUDENTS</h3>
      
      <div>
        <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Select Fee Schedule</label>
        <select 
          value={selectedSchedule}
          onChange={(e) => setSelectedSchedule(e.target.value)}
          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-red-500 outline-none"
        >
          {schedules.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.period_label})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">
          Select Students ({selectedStudents.length})
        </label>
        <div className="max-h-60 overflow-y-auto border border-white/10 bg-white/5">
          {students.map(s => (
            <label key={s.id} className="flex items-center px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
              <input 
                type="checkbox" 
                checked={selectedStudents.includes(s.id)}
                onChange={() => toggleStudent(s.id)}
                className="mr-4 accent-red-500"
              />
              <div className="flex-grow">
                <div className="text-sm font-bold">{s.full_name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">{s.level || 'No Level'}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button 
          onClick={handleSend}
          disabled={busy || selectedStudents.length === 0}
          className="flex-1 py-4 bg-white text-black font-black hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
        >
          {busy ? 'SENDING...' : `SEND ${selectedStudents.length} INVOICES`}
        </button>
        <button 
          onClick={onClose}
          className="px-8 py-4 border border-white/10 font-bold hover:bg-white/5 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/school-fees/payments', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-white/40">Loading payments...</div>;

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black tracking-tighter">PAYMENT HISTORY</h3>
      
      <div className="space-y-4">
        {payments.map((p) => (
          <div key={p.id} className="bg-white/5 border border-white/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 flex items-center justify-center border ${
                p.status === 'succeeded' ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'
              }`}>
                {p.status === 'succeeded' ? '✓' : '!'}
              </div>
              <div>
                <p className="text-lg font-black">{(p.amount_minor / 100).toLocaleString()} {p.currency}</p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{p.reference}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</p>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                p.status === 'succeeded' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="py-20 text-center border border-white/10 border-dashed">
            <p className="text-white/20 italic">No payments recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}