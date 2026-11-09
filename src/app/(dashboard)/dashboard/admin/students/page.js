'use client';

import { useState, useEffect } from 'react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStudent, setNewStudent] = useState({ full_name: '', email: '', level: 'JSS1' });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/students?limit=50');
      const json = await res.json();
      setStudents(json.data || []);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setNewStudent({ full_name: '', email: '', level: 'JSS1' });
        fetchStudents();
      }
    } catch (err) {
      alert('Failed to add student');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    try {
      await fetch(`/api/v1/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      alert('Failed to deactivate student');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Add New Student</h2>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border rounded p-2"
            placeholder="Full Name"
            value={newStudent.full_name}
            onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
            required
          />
          <input
            className="border rounded p-2"
            placeholder="Email"
            type="email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            required
          />
          <select
            className="border rounded p-2"
            value={newStudent.level}
            onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
          >
            <option value="JSS1">JSS1</option>
            <option value="JSS2">JSS2</option>
            <option value="JSS3">JSS3</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
            Add Student
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : students.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4">{s.full_name}</td>
                <td className="px-6 py-4">{s.email}</td>
                <td className="px-6 py-4">{s.level}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}