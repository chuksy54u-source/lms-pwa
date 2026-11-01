import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const schoolId = request.headers.get('x-school-id');
    const ssoKey = process.env.BEARILLY_API_KEY;
    const baseUrl = process.env.BEARILLY_URL;

    if (!schoolId || !ssoKey || !baseUrl) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headers = {
      'x-bearilly-key': ssoKey,
      'Content-Type': 'application/json',
    };

    // Fetch school dashboard overview
    const dashboardResponse = await fetch(`${baseUrl}/api/v1/schools/${schoolId}/dashboard`, {
      method: 'GET',
      headers,
    });

    if (!dashboardResponse.ok) {
      throw new Error('Failed to fetch metrics from Bearilly');
    }

    const dashboardData = await dashboardResponse.json();

    // Fetch teachers to get instructor count
    const teachersResponse = await fetch(`${baseUrl}/api/v1/teachers?limit=100`, {
      method: 'GET',
      headers,
    });
    const teachersData = teachersResponse.ok ? await teachersResponse.json() : [];

    // Fetch students for the users list
    const studentsResponse = await fetch(`${baseUrl}/api/v1/students?limit=20`, {
      method: 'GET',
      headers,
    });
    const studentsData = studentsResponse.ok ? await studentsResponse.json() : [];

    return NextResponse.json({
      totalStudents: dashboardData.active_learners || 0,
      totalInstructors: Array.isArray(teachersData) ? teachersData.length : 0,
      usersList: Array.isArray(studentsData) ? studentsData.map(student => ({
        id: student.id,
        name: student.full_name,
        email: student.email,
        role: 'student',
        status: student.status || 'active'
      })) : [],
      metrics: dashboardData
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