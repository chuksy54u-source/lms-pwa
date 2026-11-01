import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const session = await getSchoolSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearillyUrl = process.env.BEARILLY_URL?.replace(/\/+$/, '') || '';
    const bearillyApiKey = process.env.BEARILLY_API_KEY;

    if (!bearillyUrl || !bearillyApiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`${bearillyUrl}/api/v1/integration/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bearilly-key': bearillyApiKey,
      },
      body: JSON.stringify({
        email: session.user.email,
        expires_in_minutes: 15,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to establish Bearilly session' }, { status: 502 });
    }

    const data = await response.json();
    const token = data?.token || data?.session_token || data?.session;

    if (!token) {
      return NextResponse.json({ error: 'Invalid response from Bearilly' }, { status: 502 });
    }

    const cookieStore = await cookies();
    cookieStore.set('bearilly_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSchoolSession(request) {
  // TODO: Implement school-specific identity provider session verification (e.g., Supabase Auth)
  return null;
}