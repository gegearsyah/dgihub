/**
 * POST /api/v1/auth/login
 * Login user
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db';
import { generateToken, generateRefreshToken } from '@/lib/auth';
import { validateEmail } from '@/lib/validators';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }
    const { email, password } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, password_hash, full_name, user_type, status, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'ACTIVE' && user.status !== 'VERIFIED') {
      return NextResponse.json(
        {
          success: false,
          message: `Account is ${user.status.toLowerCase()}. Please verify your account.`
        },
        { status: 403 }
      );
    }

    // Generate tokens
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      userType: user.user_type as 'TALENTA' | 'MITRA' | 'INDUSTRI',
      fullName: user.full_name
    });

    const refreshToken = generateRefreshToken(user.user_id);

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', user.user_id);

    return NextResponse.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          status: user.status
        },
        expiresIn: 86400 // 24 hours in seconds
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

