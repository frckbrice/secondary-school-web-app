import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    if (!userData.username || !userData.password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.registerUser(userData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: result.user,
      token: result.token,
    });

    // Set HTTP-only cookie for session persistence
    if (result.token) {
      response.cookies.set('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
