/**
 * Pages Router API Route - Fallback for Vercel
 * POST /api/v1/auth/login
 * 
 * This is a Pages Router route that might work better on Vercel
 * than App Router routes in some cases.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db';
import { generateToken, generateRefreshToken } from '@/lib/auth';
import { validateEmail } from '@/lib/validators';

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
    const { email, password } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Database not configured'
      });
    }

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, password_hash, full_name, user_type, status, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE' && user.status !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please verify your account.`
      });
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

    return res.status(200).json({
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
        expiresIn: 86400
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
}

