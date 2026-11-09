import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { enrollmentId, action } = body;

    if (!enrollmentId || !action) {
      return NextResponse.json(
        { error: 'Missing baseline structural arguments: enrollmentId or action' }, 
        { status: 400 }
      );
    }

    const bearillySession = request.cookies.get('bearilly-session')?.value;
    if (!bearillySession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.BEARILLY_URL}/api/v1/enrollments/${enrollmentId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bearilly-session': bearillySession,
        'x-api-key': process.env.BEARILLY_API_KEY,
      },
      body: JSON.stringify({ status: action }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.error || 'Failed to update enrollment' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 200 });

  } catch (err) {
    console.error("🔴 Critical Server Crash Details:", err.message);
    return NextResponse.json(
      { error: `Internal Server Error Exception: ${err.message}` }, 
      { status: 500 }
    );
  }
}