'use client';

import { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/v1/notifications', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.data) {
          setNotifications(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest course activity and announcements.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">{note.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{note.message}</p>
              <span className="text-xs text-gray-400 mt-3 block">
                {new Date(note.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}