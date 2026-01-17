/**
 * GET /api/v1/mitra/profile
 * Get Mitra profile
 * PUT /api/v1/mitra/profile
 * Update Mitra profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    const { data: profile, error } = await db
      .from('mitra_profiles')
      .select('*')
      .eq('user_id', user.userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const body = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Update profile
    const { data: profile, error } = await db
      .from('mitra_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update profile', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error: any) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
