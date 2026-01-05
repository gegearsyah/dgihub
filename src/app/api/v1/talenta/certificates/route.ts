/**
 * GET /api/v1/talenta/certificates
 * Get certificates for learner
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get talenta profile
    const { data: talentaProfile } = await db
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

    // Get certificates
    const { data: certificates, error } = await db
      .from('certificates')
      .select(`
        *,
        courses (title, skkni_code, aqrf_level)
      `)
      .eq('talenta_id', talentaProfile.profile_id)
      .order('issued_date', { ascending: false });

    if (error) {
      console.error('Certificates fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch certificates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: certificates || []
    });
  } catch (error: any) {
    console.error('Certificates API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


