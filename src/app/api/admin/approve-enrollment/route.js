import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // 1. Always wrap the entire API logic in a try/catch block to prevent Next.js from throwing an HTML crash page
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Guardrail check: Ensure your environment variables are actually loaded
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration mismatch. Missing environment keys in .env.local' }, 
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Validate incoming request parameters safely
    const body = await request.json();
    const { enrollmentId, action } = body;

    if (!enrollmentId || !action) {
      return NextResponse.json(
        { error: 'Missing baseline structural arguments: enrollmentId or action' }, 
        { status: 400 }
      );
    }

    // 3. Execute update query on your database table
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({ status: action })
      .eq('id', enrollmentId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 4. Always return a proper clean JSON object back to the client side
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (err) {
    // This logs the exact runtime issue to your command line terminal instead of hiding it
    console.error("🔴 Critical Server Crash Details:", err.message);
    
    return NextResponse.json(
      { error: `Internal Server Error Exception: ${err.message}` }, 
      { status: 500 }
    );
  }
}