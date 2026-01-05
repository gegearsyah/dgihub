/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

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

    // Update user
    if (fullName) {
      await supabaseAdmin
        .from('users')
        .update({ full_name: fullName })
        .eq('user_id', user.userId);
    }

    // Update profile based on user type
    if (phone) {
      if (user.userType === 'TALENTA') {
        await supabaseAdmin
          .from('talenta_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      } else if (user.userType === 'MITRA') {
        await supabaseAdmin
          .from('mitra_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      } else if (user.userType === 'INDUSTRI') {
        await supabaseAdmin
          .from('industri_profiles')
          .update({ phone })
          .eq('user_id', user.userId);
      }
    }

    // Get updated user
    const { data: updatedUser } = await supabaseAdmin
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


