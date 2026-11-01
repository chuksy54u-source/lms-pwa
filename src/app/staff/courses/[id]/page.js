'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CourseEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', level: '', status: 'draft' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/v1/courses/${id}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            level: data.level || '',
            status: data.status || 'draft'
          });
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const updated = await response.json();
        setCourse(updated);
      }
    } catch (err) {
      console.error('Failed to update course:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading course...</div>;
  if (!course) return <div className="min-h-screen bg-black text-white p-8">Course not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold">Edit Course: {course.title}</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white">Back to Courses</button>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input 
            className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-white"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea 
            className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-white"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <input 
              className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-white"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select 
              className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-white"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* TODO: Implement lesson management interface using /api/v1/courses/:id/lessons */}
    </div>
  );
}