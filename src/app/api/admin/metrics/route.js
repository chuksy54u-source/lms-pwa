import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = request.headers.get('x-bearilly-session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.BEARILLY_URL}/api/v1/admin/metrics`, {
      method: 'GET',
      headers: {
        'x-bearilly-session': session,
        'x-api-key': process.env.BEARILLY_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics from Bearilly');
    }

    const result = await response.json();
    const data = result.data || {};

    return NextResponse.json({
      totalStudents: data.totalStudents || 0,
      totalInstructors: data.totalInstructors || 0,
      usersList: data.usersList || []
    }, { status: 200 });

  } catch (err) {
    console.error("Master administrative metrics engine failure:", err.message);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      totalStudents: 0, 
      totalInstructors: 0, 
      usersList: [] 
    }, { status: 500 });
  }
}