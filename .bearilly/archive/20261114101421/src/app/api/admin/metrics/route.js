import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Initialize Supabase Admin Client using the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Query the profiles database directory
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, is_instructor, is_admin, role, email');

    if (profilesError) throw profilesError;

    // 3. Safely fetch auth users (wrapped so it doesn't break the whole page if it fails)
    let authMap = new Map();
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000 // Increase the limit to capture everyone
      });
      if (!authError && authData?.users) {
        authMap = new Map(authData.users.map(user => [user.id, user.email]));
      }
    } catch (e) {
      console.warn("Auth list lookup bypassed:", e.message);
    }

    // 4. Merge records securely
    const safeUsers = (profiles || []).map(profile => ({
      ...profile,
      email: profile.email || authMap.get(profile.id) || 'No Email Verified'
    }));

    // 5. Compute global telemetry metrics tracking indicators
    const totalStudents = safeUsers.filter(u => !u.is_instructor && !u.is_admin).length;
    const totalInstructors = safeUsers.filter(u => u.is_instructor).length;

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      usersList: safeUsers
    }, { status: 200 });

  } catch (err) {
    // CRITICAL: Log the actual error message to Netlify logs so you can read it
    console.error("Master administrative metrics engine failure:", err.message);
    return NextResponse.json({ 
      error: err.message,
      totalStudents: 0, 
      totalInstructors: 0, 
      usersList: [] 
    }, { status: 500 });
  }
}