import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { scholarId, action } = await req.json();

    if (!scholarId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const bearillyResponse = await fetch(`${process.env.BEARILLY_API_URL}/api/v1/students/${scholarId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEARILLY_API_KEY}`
      },
      body: JSON.stringify({
        status: action === 'verified' ? 'active' : 'inactive'
      })
    });

    if (!bearillyResponse.ok) {
      throw new Error('Failed to update student status via Bearilly API');
    }

    // TODO: Implement email notification logic via Bearilly-integrated service or custom webhook
    // as the current implementation relies on external Resend configuration.

    return NextResponse.json({ success: true, status: action });

  } catch (err) {
    console.error("Scholar verification error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}