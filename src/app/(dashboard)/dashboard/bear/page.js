'use client';

import { useState, useEffect, useRef } from 'react';

export default function BearTutorPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/v1/tutor/messages');
      const json = await res.json();
      if (json.data) {
        const history = json.data.flatMap((m) => [
          { id: `${m.id}-q`, role: 'user', text: m.question },
          { id: `${m.id}-a`, role: 'assistant', text: m.answer },
        ]);
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const json = await res.json();
      
      if (json.data) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: json.data.answer }]);
      } else {
        throw new Error('No response from tutor');
      }
    } catch (err) {
      setError('Sorry, I couldn\'t get an answer right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Tutor</h1>
        <p className="text-gray-600">Ask questions about your course materials.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6 min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">Ask your first question to get started!</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg text-gray-500 italic">Tutor is thinking...</div>
            </div>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What is a numerator?"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}