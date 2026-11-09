'use client';

import { useState, useEffect } from 'react';

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/v1/school-fees/invoices', {
          headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        if (result.data) {
          setInvoices(result.data);
        }
      } catch (err) {
        setError('Failed to load fee information.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleCheckout = async (invoiceId) => {
    try {
      const response = await fetch(`/api/v1/school-fees/invoices/${invoiceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      }
    } catch (err) {
      alert('Checkout initialization failed.');
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading your fee records...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.description || 'School Fee Invoice'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.currency} {invoice.amount_minor / 100}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {invoice.status !== 'paid' && (
                      <button 
                        onClick={() => handleCheckout(invoice.id)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}