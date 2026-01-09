/**
 * Pages Router API Route - Fallback for Vercel
 * POST /api/v1/auth/register
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db';
import { validateEmail, validateNIK, validatePassword } from '@/lib/validators';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, fullName, userType, nik, phone } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password || !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!['TALENTA', 'MITRA', 'INDUSTRI'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    if (nik && !validateNIK(nik)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NIK format (must be 16 digits)'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Database not configured'
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
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
      return res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
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

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      data: {
        userId: user.user_id,
        email: user.email,
        userType: user.user_type,
        status: user.status,
        verificationRequired: true
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
}

