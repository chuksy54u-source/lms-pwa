import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify token & Admin Role
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized user session' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Administrative privilege required' }, { status: 403 });
    }

    const { scholarId, email, fullName, action } = await req.json();

    if (!scholarId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Update status on scholarship_students table
    const { error: updateErr } = await supabaseAdmin
      .from('scholarship_students')
      .update({ status: action })
      .eq('id', scholarId);

    if (updateErr) throw updateErr;

    // 2. If action is 'verified', dispatch the automated congratulatory email
    if (action === 'verified' && email) {
      await resend.emails.send({
        from: 'Ornate Education <admissions@ornatetechschool.top>',
        to: [email],
        subject: '🎉 Scholarship Verification Approved - Access Granted!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #07070a; color: #ffffff; padding: 32px; border: 1px solid #222;">
            <h2 style="color: #3b82f6; font-size: 20px; text-transform: uppercase;">Ornate Education</h2>
            <hr style="border-color: #333;" />
            <h1 style="font-size: 24px; color: #ffffff;">Congratulations, ${fullName || 'Scholar'}! 🎓</h1>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              We are delighted to inform you that your scholarship application and account status have been 
              <strong>officially verified</strong> by our administrative team.
            </p>
            <div style="background-color: #111827; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 14px;">Status: VERIFIED & APPROVED</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">You can now log in to access your course portal and learning dashboard.</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ornatetechschool.top'}/login" 
               style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Log In To Portal Now
            </a>
            <p style="color: #64748b; font-size: 11px; margin-top: 32px;">
              If you have any questions, please contact our support desk through your student portal.
            </p>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, status: action });

  } catch (err) {
    console.error("Scholar verification error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}