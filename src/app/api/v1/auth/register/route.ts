/**
 * POST /api/v1/auth/register
 * Register new user
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db';
import { validateEmail, validateNIK, validatePassword } from '@/lib/validators';

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
    const body = await request.json();
    const { email, password, fullName, userType, nik, phone } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!password || !validatePassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!['TALENTA', 'MITRA', 'INDUSTRI'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (nik && !validateNIK(nik)) {
      return NextResponse.json(
        { success: false, message: 'Invalid NIK format (must be 16 digits)' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 24);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        user_type: userType,
        status: 'PENDING_VERIFICATION',
        verification_code: verificationCode,
        verification_code_expires_at: verificationCodeExpires.toISOString()
      })
      .select('user_id, email, full_name, user_type, status')
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { success: false, message: 'Registration failed' },
        { status: 500 }
      );
    }

    // Create profile based on user type
    if (userType === 'TALENTA') {
      await supabaseAdmin.from('talenta_profiles').insert({
        user_id: user.user_id,
        nik: nik || null,
        phone: phone || null
      });
    } else if (userType === 'MITRA') {
      await supabaseAdmin.from('mitra_profiles').insert({
        user_id: user.user_id
      });
    } else if (userType === 'INDUSTRI') {
      await supabaseAdmin.from('industri_profiles').insert({
        user_id: user.user_id
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      data: {
        userId: user.user_id,
        email: user.email,
        userType: user.user_type,
        status: user.status,
        verificationRequired: true
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

