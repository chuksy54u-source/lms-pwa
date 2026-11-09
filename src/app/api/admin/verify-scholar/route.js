import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = req.headers.get('x-bearilly-session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scholarId, email, fullName, action } = await req.json();

    if (!scholarId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Proxy the verification request to Bearilly
    const response = await fetch(`${process.env.BEARILLY_URL}/api/v1/admin/scholarships/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BEARILLY_API_KEY,
        'x-bearilly-session': session
      },
      body: JSON.stringify({ scholarId, action })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Failed to update scholar status' }, { status: response.status });
    }

    const result = await response.json();

    // TODO: If action is 'verified', Bearilly handles the automated notification system.
    // If custom school-specific logic is required beyond Bearilly's automated emails, 
    // implement it here using the verified Bearilly session context.

    return NextResponse.json({ success: true, data: result.data });

  } catch (err) {
    console.error("Scholar verification error:", err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}