import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    // Call backend with idToken via server-side fetch to configured BASE_URL
    console.log('Calling backend with idToken:', tokens.id_token ? 'present' : 'missing');
    const backendResp = await fetch(`${BASE_URL}/api/Auth/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: tokens.id_token }),
    });
    const backendData = await backendResp.json();
    if (!backendResp.ok) {
      console.error('Backend Google login failed:', backendData);
      return NextResponse.redirect(new URL('/login?error=backend_login_failed', request.url));
    }


    if (backendData.message && backendData.message.includes('Token Google không hợp lệ')) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Redirect to home page with tokens in URL params for client-side handling
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('accessToken', backendData.data.accessToken);
    redirectUrl.searchParams.set('refreshToken', backendData.data.refreshToken);
    redirectUrl.searchParams.set('googleAuth', 'true');
    
    const response = NextResponse.redirect(redirectUrl);

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}