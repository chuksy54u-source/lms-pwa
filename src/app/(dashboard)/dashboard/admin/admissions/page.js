'use client';

import { useState, useEffect } from 'react';

export default function AdmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, settingsRes] = await Promise.all([
          fetch('/api/v1/schools/me/admissions/applications'),
          fetch('/api/v1/schools/me/admissions/settings')
        ]);

        if (!appsRes.ok || !settingsRes.ok) throw new Error('Failed to fetch admissions data');

        const appsData = await appsRes.json();
        const settingsData = await settingsRes.json();

        setApplications(appsData.data || []);
        setSettings(settingsData.data || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdmit = async (applicationId) => {
    try {
      const res = await fetch(`/api/v1/schools/me/admissions/applications/${applicationId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      }
    } catch (err) {
      console.error('Failed to admit student', err);
    }
  };

  if (loading) return <div className="p-6">Loading admissions...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admissions Management</h1>
        <div className="text-sm text-gray-500">
          Status: {settings?.enabled ? 'Accepting Applications' : 'Closed'}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap">{app.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.class_applied}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{app.status?.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleAdmit(app.id)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    Admit Student
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No pending applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TODO: Add Admissions Settings form for editing fee_gate_enabled and application_fee_minor */}
    </div>
  );
}