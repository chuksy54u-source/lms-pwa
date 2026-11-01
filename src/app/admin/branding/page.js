'use client';

import { useState, useEffect } from 'react';

export default function BrandingPage() {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    school_name: '',
    primary_color: '#000000',
    logo_url: ''
  });

  useEffect(() => {
    async function fetchBranding() {
      try {
        const response = await fetch('/api/v1/tenant/branding', {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load branding');
        const data = await response.json();
        setBranding(data);
        setFormData({
          school_name: data.school_name || '',
          primary_color: data.primary_color || '#000000',
          logo_url: data.logo_url || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBranding();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/tenant/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to save branding');
      alert('Branding updated successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading branding settings...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">School Branding</h1>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">School Name</label>
          <input
            type="text"
            className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded"
            value={formData.school_name}
            onChange={(e) => setFormData({...formData, school_name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <input
            type="color"
            className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded cursor-pointer"
            value={formData.primary_color}
            onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Logo URL</label>
          <input
            type="text"
            className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded"
            value={formData.logo_url}
            onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
          />
        </div>
        <button 
          type="submit"
          className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-neutral-200 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}