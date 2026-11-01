'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    invite_code: '',
    full_name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register student via Bearilly proxy
      const regResponse = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!regResponse.ok) {
        const errData = await regResponse.json();
        throw new Error(errData.message || 'Registration failed');
      }

      // 2. After successful registration, trigger the school's identity provider flow
      // Note: The school keeps its own auth system. We assume the provider 
      // handles the session creation after this registration step.
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Create Account</h1>
        {success ? (
          <div className="p-4 bg-emerald-900/20 border border-emerald-500 rounded">
            Account created successfully! Please proceed to login.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <input
              name="invite_code"
              placeholder="Invite Code"
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded"
              onChange={handleInputChange}
              required
            />
            <input
              name="full_name"
              placeholder="Full Name"
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded"
              onChange={handleInputChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded"
              onChange={handleInputChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded"
              onChange={handleInputChange}
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded hover:bg-neutral-200 transition"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        )}
        <p className="mt-6 text-neutral-500 text-sm">
          Already have an account? <Link href="/login" className="text-white underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}