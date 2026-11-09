'use client';

import { useState, useEffect } from 'react';

export default function AdminFeesPage() {
  const [schedules, setSchedules] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedulesRes, invoicesRes] = await Promise.all([
          fetch('/api/v1/school-fees/schedules'),
          fetch('/api/v1/school-fees/invoices')
        ]);

        const schedulesData = await schedulesRes.json();
        const invoicesData = await invoicesRes.json();

        setSchedules(schedulesData.data || []);
        setInvoices(invoicesData.data || []);
      } catch (err) {
        setError('Failed to load fee data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading fee management...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <section>
        <h2 className="text-lg font-semibold mb-4">Fee Schedules</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.period_label}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.due_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{inv.student_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(inv.amount_minor / 100).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TODO: Implement Create Schedule and Invoice generation forms */}
    </div>
  );
}