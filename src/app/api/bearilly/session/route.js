import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const session = await getSchoolSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.BEARILLY_URL}/api/v1/integration/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEARILLY_API_KEY}`,
      },
      body: JSON.stringify({
        email: session.user.email,
        expires_in_minutes: 15,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to establish Bearilly session' }, { status: 502 });
    }

    const { token } = await response.json();

    cookies().set('bearilly_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSchoolSession() {
  // TODO: Implement school-specific identity provider session verification (e.g., Supabase)
  return null;
}