'use client';

import { useState, useEffect } from 'react';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeacher, setNewTeacher] = useState({ full_name: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/teachers?limit=50');
      const json = await res.json();
      setTeachers(json.data || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await fetch('/api/v1/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });
      setNewTeacher({ full_name: '', email: '' });
      fetchTeachers();
    } catch (err) {
      console.error('Failed to add teacher:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return;
    try {
      await fetch(`/api/v1/teachers/${id}`, { method: 'DELETE' });
      fetchTeachers();
    } catch (err) {
      console.error('Failed to delete teacher:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Add New Teacher</h2>
        <form onSubmit={handleAddTeacher} className="flex gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border rounded px-3 py-2 flex-1"
            value={newTeacher.full_name}
            onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border rounded px-3 py-2 flex-1"
            value={newTeacher.email}
            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center">No teachers found.</td></tr>
            ) : (
              teachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{t.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* TODO: Implement bulk CSV import feature using /api/v1/teachers/import */}
    </div>
  );
}