'use client';

import { useState, useEffect } from 'react';

export default function GradesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/auth/me', {
          headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        
        if (result.data?.progress?.courses) {
          setCourses(result.data.progress.courses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        setError('Failed to load grade data.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading your academic progress...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Grades & Progress</h1>
      
      {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded">{error}</div>}

      {courses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No course progress found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                  <p className="text-sm text-gray-500">Progress: {course.completion_percentage || 0}%</p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-indigo-600">
                    {course.current_grade || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Current Grade</span>
                </div>
              </div>
              
              {/* TODO: Integrate detailed assessment breakdown from /api/v1/assessments/:id/submissions */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View Detailed Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}