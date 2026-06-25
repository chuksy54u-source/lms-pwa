import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Initialize Supabase Admin Client using the service role key to access auth schemas
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Query the profiles database directory
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, is_instructor, is_admin, role, email');

    if (profilesError) throw profilesError;

    // 3. Fetch the true system accounts directly from auth management to resolve missing emails
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) throw authError;

    // Create a fast-lookup map for email strings matching user IDs
    const authMap = new Map(authUsers.map(user => [user.id, user.email]));

    // 4. Merge records so the Admin panel never shows NULL
    const safeUsers = (profiles || []).map(profile => ({
      ...profile,
      // If the profile column email is null, fallback directly to the auth table record
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
    console.error("Master administrative metrics engine compilation failure:", err.message);
    return NextResponse.json({ totalStudents: 0, totalInstructors: 0, usersList: [] }, { status: 500 });
  }
}