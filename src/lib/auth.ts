/**
 * Authentication Utilities
 * JWT token verification and user management
 */

import jwt from 'jsonwebtoken';
import { supabaseAdmin } from './db';

export interface UserPayload {
  userId: string;
  email: string;
  userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
  fullName?: string;
}

/**
 * Verify JWT token and return user payload
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const secret = process.env.JWT_SECRET || 'change-this-secret';
    const decoded = jwt.verify(token, secret) as any;

    // Verify user still exists and is active
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name, user_type, status')
      .eq('user_id', decoded.userId)
      .single();

    if (error || !user) {
      return null;
    }

    if (user.status !== 'VERIFIED' && user.status !== 'ACTIVE') {
      return null;
    }

    return {
      userId: user.user_id,
      email: user.email,
      userType: user.user_type as 'TALENTA' | 'MITRA' | 'INDUSTRI',
      fullName: user.full_name
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get user from request headers
 */
export async function getUserFromRequest(
  headers: Headers
): Promise<UserPayload | null> {
  const authHeader = headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: UserPayload): string {
  const secret = process.env.JWT_SECRET || 'change-this-secret';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

/**
 * Check if user has required user type
 */
export function requireUserType(
  user: UserPayload | null,
  ...allowedTypes: string[]
): boolean {
  if (!user) return false;
  return allowedTypes.includes(user.userType);
}


