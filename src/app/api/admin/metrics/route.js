import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const schoolId = request.headers.get('x-school-id');
    if (!schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch school dashboard metrics from Bearilly API
    const response = await fetch(`${process.env.BEARILLY_API_URL}/api/v1/schools/${schoolId}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BEARILLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics from Bearilly');
    }

    const data = await response.json();

    // Mapping Bearilly dashboard response to existing metrics structure
    // Bearilly dashboard provides: active_learners, slots_used, avg_scores, students_needing_help
    return NextResponse.json({
      totalStudents: data.active_learners || 0,
      totalInstructors: 0, // TODO: Map to staff endpoint if required by future schema
      usersList: [], // TODO: Bearilly provides aggregated metrics; list operations require specific student/staff endpoints
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