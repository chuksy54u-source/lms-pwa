import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // The school's own auth system verifies the session.
    // The proxy ensures the request is authenticated before reaching this route.
    const schoolId = request.headers.get('x-school-id');
    const ssoKey = process.env.BEARILLY_API_KEY;

    if (!schoolId || !ssoKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.BEARILLY_URL}/api/v1/schools/${schoolId}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ssoKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics from Bearilly');
    }

    const data = await response.json();

    return NextResponse.json({
      totalStudents: data.active_learners || 0,
      totalInstructors: 0, // TODO: Map to /api/v1/teachers if required by future schema
      usersList: [], // TODO: Requires pagination via /api/v1/students and /api/v1/teachers
      metrics: data
    }, { status: 200 });

  } catch (err) {
    console.error("Master administrative metrics engine failure:", err.message);
    return NextResponse.json({ 
      error: err.message,
      totalStudents: 0, 
      totalInstructors: 0, 
      usersList: [] 
    }, { status: 500 });
  }
}