'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function AssignmentPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        // Fetch student dashboard to locate assignment details
        const res = await fetch('/api/v1/auth/me');
        const { data: user } = await res.json();
        
        if (user?.id) {
          const dashRes = await fetch(`/api/v1/students/${user.id}/dashboard`);
          const { data: dashboard } = await dashRes.json();
          
          // Locate assignment across courses
          const found = dashboard?.progress?.courses
            ?.flatMap(c => c.assignments || [])
            .find(a => a.id === id);
            
          setAssignment(found || null);
        }
      } catch (err) {
        setError('Failed to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading assignment...</div>;
  if (error || !assignment) return <div className="p-6 text-red-500">{error || 'Assignment not found.'}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/tasks" className="text-sm text-blue-600 hover:underline mb-4 block">
          &larr; Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-600 mt-2">{assignment.description}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Submission Requirements</h2>
        <div className="prose max-w-none text-gray-700 mb-6">
          {assignment.requirements || 'No specific requirements provided.'}
        </div>

        {/* TODO: Implement file upload proxy for assignment submission */}
        <div className="border-t pt-6">
          <button 
            disabled 
            className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed"
          >
            Submit Assignment (Coming Soon)
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Evaluation Criteria</h3>
        <div className="bg-gray-50 p-4 rounded border border-gray-100 text-sm text-gray-600">
          {assignment.evaluation_criteria || 'Standard grading rubric applies.'}
        </div>
      </div>
    </div>
  );
}