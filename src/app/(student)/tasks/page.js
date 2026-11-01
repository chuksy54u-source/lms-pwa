'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Student task list.
 * Data is fetched via the school's same-origin proxy to Bearilly's API.
 */
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('due');

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Proxy request through the school's API route to Bearilly
        const response = await fetch('/api/v1/tasks', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => t.status === tab);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Link href="/tasks/grades" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
          My Grades
        </Link>
      </header>

      <div className="flex gap-4 mb-8">
        {['due', 'submitted', 'graded'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full capitalize ${tab === t ? 'bg-blue-600' : 'bg-white/5'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">Loading tasks...</div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-white/60 mt-1">{task.course_title}</p>
                <div className="mt-4">
                  <span className="px-2 py-1 bg-white/10 rounded text-sm">{task.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/40">No tasks found in this category.</p>
          )}
        </div>
      )}
      
      {/* TODO: Integrate file assignment uploads when backend support is enabled */}
    </div>
  );
}