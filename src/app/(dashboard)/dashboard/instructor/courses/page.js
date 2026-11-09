'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/v1/courses', {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const result = await response.json();
        setCourses(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-600">Manage your school's curriculum and Bearilly catalogue integration.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading courses...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded text-red-700">Error: {error}</div>
      ) : (
        <div className="grid gap-6">
          {courses.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No courses available yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{course.level}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {course.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link href={`/dashboard/instructor/courses/${course.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* TODO: Add course creation modal/form for school-owned courses */}
    </div>
  );
}