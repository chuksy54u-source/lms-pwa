'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StaffCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/v1/courses', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Staff Portal</h1>
        <nav className="hidden md:flex gap-6 text-sm text-gray-400">
          <Link href="/staff/courses" className="text-white">Courses</Link>
          <Link href="/staff/students">Students</Link>
        </nav>
      </header>

      <main className="p-6 md:p-12 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-light mb-2">Course Management</h2>
            <p className="text-gray-400">Manage your curriculum and Bearilly integrations.</p>
          </div>
          {/* TODO: Implement Create Course modal using POST /api/v1/courses */}
          <button className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition">
            Create New Course
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading courses...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="border border-white/10 p-6 rounded-2xl hover:border-white/30 transition">
                <h3 className="text-xl font-medium mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{course.description || 'No description provided.'}</p>
                <div className="flex gap-2">
                  <Link 
                    href={`/staff/courses/${course.id}`}
                    className="text-xs border border-white/20 px-3 py-1 rounded-full hover:bg-white/10"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-gray-500 italic">No courses found in the system.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}