'use client';

import { useState, useEffect } from 'react';

export default function BrandingPage() {
  const [branding, setBranding] = useState({ primary_color: '#0F6B5C' });
  const [tutor, setTutor] = useState({ name: 'AI Tutor', accessories: { head: '', neck: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/schools/me/branding');
        const { data } = await res.json();
        if (data) {
          setBranding(data.branding || { primary_color: '#0F6B5C' });
          setTutor(data.tutor || { name: 'AI Tutor', accessories: { head: '', neck: '' } });
        }
      } catch (err) {
        console.error('Failed to load branding', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/v1/schools/me/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding, tutor }),
      });
    } catch (err) {
      console.error('Failed to save branding', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading branding settings...</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Branding</h1>
        <p className="text-gray-500">Customize your school's appearance and AI tutor persona.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input
              type="color"
              value={branding.primary_color}
              onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
              className="mt-1 block w-full h-10 rounded border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tutor Name</label>
            <input
              type="text"
              value={tutor.name}
              onChange={(e) => setTutor({ ...tutor, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* TODO: Implement logo upload component using /api/v1/schools/:id/branding/logo */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Logo Management</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a PNG, JPEG or WebP logo (max 2MB).</p>
        <div className="mt-4">
          <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
            Upload New Logo
          </button>
        </div>
      </div>
    </div>
  );
}