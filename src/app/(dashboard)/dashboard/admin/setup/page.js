'use client';

import { useState, useEffect } from 'react';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ school_name: '', school_type: 'secondary' });

  useEffect(() => {
    fetchSetup();
  }, []);

  const fetchSetup = async () => {
    try {
      const res = await fetch('/api/v1/schools/me/setup');
      const json = await res.json();
      if (json.data) {
        setSetup(json.data);
        setFormData({
          school_name: json.data.school_name || '',
          school_type: json.data.school_type || 'secondary'
        });
      }
    } catch (err) {
      console.error('Failed to fetch setup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/v1/schools/me/setup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, step: 'basics' })
      });
      await fetchSetup();
    } catch (err) {
      console.error('Failed to save setup:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading setup configuration...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">School Setup</h1>
      
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">School Name</label>
            <input
              type="text"
              value={formData.school_name}
              onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">School Type</label>
            <select
              value={formData.school_type}
              onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="secondary">Secondary</option>
              <option value="college">College</option>
              <option value="vocational">Vocational</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium">API Keys</h3>
            <p className="text-sm text-gray-600 mb-2">Manage server-to-server integration keys.</p>
            <button className="text-blue-600 text-sm font-medium">View API Keys →</button>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium">Domain Verification</h3>
            <p className="text-sm text-gray-600 mb-2">Configure custom domains for your student portal.</p>
            <button className="text-blue-600 text-sm font-medium">Manage Domains →</button>
          </div>
          {/* TODO: Add legacy migration settings UI here */}
        </div>
      </div>
    </div>
  );
}