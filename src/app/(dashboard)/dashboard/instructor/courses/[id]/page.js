'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorCourseDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, unitsRes, resultsRes] = await Promise.all([
          fetch(`/api/v1/courses/${id}`),
          fetch(`/api/v1/courses/${id}/units`),
          fetch(`/api/v1/courses/${id}/results`)
        ]);

        if (!courseRes.ok || !unitsRes.ok || !resultsRes.ok) throw new Error('Failed to load course data');

        const courseData = await courseRes.json();
        const unitsData = await unitsRes.json();
        const resultsData = await resultsRes.json();

        setCourse(courseData.data);
        setUnits(unitsData.data || []);
        setResults(resultsData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6">Loading course details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
        <p className="text-gray-600">{course?.description}</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-4">Course Units</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {units.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {units.map((unit) => (
                <li key={unit.id} className="p-4">
                  <h3 className="font-medium">{unit.title}</h3>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-gray-500">No units added yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Student Results</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((res) => (
                <tr key={res.student_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{res.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{res.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TODO: Add UI for creating units and assessments using POST /api/v1/courses/:id/units and POST /api/v1/courses/:id/assessments */}
    </div>
  );
}