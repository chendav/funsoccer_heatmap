import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle error from Authing
  if (error) {
    console.error('Authing OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  // Validate code parameter
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Call backend API to exchange code for tokens
    const response = await api.auth.callback(code);
    
    // Create response with redirect
    const redirectUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(redirectUrl);
    
    // Set cookies for authentication
    res.cookies.set('access_token', response.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: response.expires_in || 7200,
      path: '/',
    });
    
    res.cookies.set('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Store user info in localStorage (will be handled client-side)
    // We'll pass it through URL params temporarily
    const userParam = encodeURIComponent(JSON.stringify(response.user));
    redirectUrl.searchParams.set('user', userParam);
    redirectUrl.searchParams.set('token', response.access_token);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to handle OAuth callback:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}