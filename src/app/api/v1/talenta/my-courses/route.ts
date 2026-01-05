/**
 * GET /api/v1/talenta/my-courses
 * Get enrolled courses for learner
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;

    // Check authorization
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    // Get talenta profile
    const { data: talentaProfile } = await supabaseAdmin
      .from('talenta_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (!talentaProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get enrollments
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('talenta_id', talentaProfile.profile_id);

    if (error) {
      console.error('Enrollments fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollments || []
    });
  } catch (error: any) {
    console.error('My courses API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


