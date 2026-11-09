'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('due');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Fetch student dashboard to get courses and progress
        const res = await fetch('/api/v1/auth/me');
        const { data: user } = await res.json();
        
        if (!user?.id) throw new Error('Not authenticated');

        const dashRes = await fetch(`/api/v1/students/${user.id}/dashboard`);
        const { data: dashboard } = await dashRes.json();
        
        // Build tasks from enrolled courses
        // Note: As per instructions, build quiz tasks from courses and assessments
        // TODO: Implement assessment fetching logic via lib/app/tasks.js helper
        const courseTasks = (dashboard?.progress?.courses || []).flatMap(c => 
          (c.assessments || []).map(a => ({ ...a, course_title: c.title }))
        );
        
        setTasks(courseTasks);
      } catch (err) {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/dashboard/tasks/grades" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
          My Grades
        </Link>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {['due', 'submitted', 'graded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">All caught up! No tasks currently due.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.course_title}</p>
                </div>
                <Link href={`/dashboard/tasks/assignment/${task.id}`} className="text-blue-600 font-medium text-sm">
                  View Task
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* TODO: Implement file upload UI once verified endpoint is available */}
      <div className="mt-8 p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Homework uploads are currently unavailable.</p>
      </div>
    </div>
  );
}