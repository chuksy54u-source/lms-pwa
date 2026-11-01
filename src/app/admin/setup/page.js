'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Setup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'primary',
    students: '0',
    staff: '0',
    platform: 'Custom'
  });

  const steps = [
    { id: 'basics', title: 'School Basics' },
    { id: 'capacity', title: 'Community Size' },
    { id: 'tech', title: 'Technology' }
  ];

  const handleNext = async () => {
    setLoading(true);
    try {
      // Proxying to Bearilly via same-origin server route
      const response = await fetch(`/api/v1/schools/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: steps[step].id,
          data: formData
        })
      });

      if (!response.ok) throw new Error('Failed to update setup');

      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{steps[step].title}</h1>
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          {step === 0 && (
            <div className="space-y-4">
              <input 
                className="w-full bg-black border border-zinc-700 p-3 rounded"
                placeholder="School Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input 
                type="number"
                className="w-full bg-black border border-zinc-700 p-3 rounded"
                placeholder="Number of Students"
                value={formData.students}
                onChange={(e) => setFormData({...formData, students: e.target.value})}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-zinc-400">Confirm your technology stack settings.</p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button 
              disabled={step === 0 || loading}
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-zinc-800 rounded"
            >
              Back
            </button>
            <button 
              disabled={loading}
              onClick={handleNext}
              className="px-6 py-2 bg-red-600 rounded font-bold"
            >
              {loading ? 'Saving...' : (step === steps.length - 1 ? 'Finish' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}