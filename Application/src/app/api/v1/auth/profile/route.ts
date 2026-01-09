/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request.headers);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Update user
    if (fullName) {
      await db
        .from('users')
        .update({ full_name: fullName })
        .eq('user_id', user.userId);
    }

    // Update profile based on user type
    if (phone) {
      if (user.userType === 'TALENTA') {
        await db
          .from('talenta_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      } else if (user.userType === 'MITRA') {
        await db
          .from('mitra_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      } else if (user.userType === 'INDUSTRI') {
        await db
          .from('industri_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      }
    }

    // Get updated user
    const { data: updatedUser } = await db
      .from('users')
      .select('user_id, email, full_name, user_type, status')
      .eq('user_id', user.userId)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred updating profile' },
      { status: 500 }
    );
  }
}


