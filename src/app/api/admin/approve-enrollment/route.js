import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.BEARILLY_API_KEY;
    const apiBase = process.env.BEARILLY_API_URL || 'https://api.bearilly.com';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration mismatch. Missing BEARILLY_API_KEY' }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    const { enrollmentId, action } = body;

    if (!enrollmentId || !action) {
      return NextResponse.json(
        { error: 'Missing baseline structural arguments: enrollmentId or action' }, 
        { status: 400 }
      );
    }

    // Bearilly API Mapping:
    // The verified map supports GET, POST (create), and DELETE (drop).
    // It does not currently support a direct PATCH/UPDATE for status in the provided map.
    
    if (action === 'rejected' || action === 'deleted') {
      // Map 'rejected' to DELETE (dropping the enrolment) as per Bearilly API map
      const response = await fetch(`${apiBase}/api/v1/enrolments/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ error: errorData.message || 'Bearilly API error' }, { status: response.status });
      }

      return NextResponse.json({ success: true, message: 'Enrolment removed from Bearilly' }, { status: 200 });
    }

    // TODO: Implement 'approved' status update once Bearilly supports PATCH /api/v1/enrolments/:id in the verified map.
    // Currently, the map only allows creating (POST) or deleting (DELETE).
    return NextResponse.json({ 
      success: true, 
      message: `Action '${action}' received. Note: Bearilly system of record update for status is pending PATCH support in the API map.`,
      todo: "Map to PATCH /api/v1/enrolments/:id when available"
    }, { status: 200 });

  } catch (err) {
    console.error("🔴 Bearilly Migration Error:", err.message);
    return NextResponse.json(
      { error: `Internal Server Error Exception: ${err.message}` }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Approve Enrollment Playground</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background-color: #f9fafb; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e5e7eb; }
      </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-6">
      <div class="max-w-md w-full card p-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Enrollment Playground</h1>
            <p class="text-sm text-gray-500">Test Bearilly API Integration</p>
          </div>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment ID</label>
            <input type="text" id="enrollmentId" placeholder="Enter ID..." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Action</label>
            <select id="action" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
              <option value="approved">Approve (Status Update)</option>
              <option value="rejected">Reject (Delete Record)</option>
            </select>
          </div>
          
          <button onclick="testApi()" id="submitBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
            Execute Operation
          </button>
        </div>
        
        <div id="result" class="mt-8 hidden">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">API Response</span>
            <span id="statusBadge" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"></span>
          </div>
          <pre id="resultText" class="p-4 rounded-lg bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto max-h-48"></pre>
        </div>
      </div>

      <script>
        async function testApi() {
          const enrollmentId = document.getElementById('enrollmentId').value;
          const action = document.getElementById('action').value;
          const btn = document.getElementById('submitBtn');
          const resultDiv = document.getElementById('result');
          const resultText = document.getElementById('resultText');
          const statusBadge = document.getElementById('statusBadge');
          
          if (!enrollmentId) {
            alert('Please provide an Enrollment ID');
            return;
          }
          
          btn.disabled = true;
          btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...';
          
          try {
            const res = await fetch('/api/admin/approve-enrollment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enrollmentId, action })
            });
            const data = await res.json();
            
            resultDiv.classList.remove('hidden');
            resultText.innerText = JSON.stringify(data, null, 2);
            
            if (res.ok) {
              statusBadge.innerText = 'Success ' + res.status;
              statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700';
              resultText.className = 'p-4 rounded-lg bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto max-h-48';
            } else {
              statusBadge.innerText = 'Error ' + res.status;
              statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700';
              resultText.className = 'p-4 rounded-lg bg-gray-900 text-red-400 text-xs font-mono overflow-x-auto max-h-48';
            }
          } catch (err) {
            alert('Network Error: ' + err.message);
          } finally {
            btn.disabled = false;
            btn.innerText = 'Execute Operation';
          }
        }
      </script>
    </body>
    </html>
  `;
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}