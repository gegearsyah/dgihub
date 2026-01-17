/**
 * GET /api/v1/mitra/courses/[id]/participants
 * Get course participants (enrollments) for a specific course
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const { id: courseId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get mitra profile
    const { data: mitraProfile } = await db
      .from('mitra_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (!mitraProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify course belongs to this mitra
    const { data: course } = await db
      .from('kursus')
      .select('kursus_id, title')
      .eq('kursus_id', courseId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found or not owned by this Mitra' },
        { status: 404 }
      );
    }

    // Get enrollments first
    // Note: Primary key is 'id', not 'enrollment_id'
    const { data: enrollments, error: enrollmentsError } = await db
      .from('enrollments')
      .select('id, talenta_id, status, enrolled_at, progress')
      .eq('kursus_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      console.error('Enrollments fetch error:', enrollmentsError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch participants', error: enrollmentsError.message },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get talenta profile IDs
    const talentaIds = enrollments.map((e: any) => e.talenta_id);
    
    // Get talenta profiles with users
    const { data: talentaProfiles, error: profilesError } = await db
      .from('talenta_profiles')
      .select(`
        profile_id,
        user_id,
        users!inner(
          user_id,
          full_name,
          email
        )
      `)
      .in('profile_id', talentaIds);

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch participant profiles', error: profilesError.message },
        { status: 500 }
      );
    }

    // Create a map of profile_id to profile data
    const profileMap = new Map(
      talentaProfiles?.map((p: any) => [p.profile_id, p]) || []
    );

    // Get last accessed time from material_completions
    const { data: lastAccessData } = await db
      .from('material_completions')
      .select('talenta_id, updated_at')
      .in('talenta_id', talentaIds)
      .order('updated_at', { ascending: false });

    // Create a map of last accessed times
    const lastAccessMap = new Map(
      lastAccessData?.map((la: any) => [la.talenta_id, la.updated_at]) || []
    );

    // Transform enrollments to include participant info
    const participants = enrollments.map((enrollment: any) => {
      const talentaProfile = profileMap.get(enrollment.talenta_id);
      const user = talentaProfile?.users;
      
      return {
        enrollment_id: enrollment.id, // Primary key is 'id'
        talenta_id: enrollment.talenta_id,
        full_name: user?.full_name || 'Unknown',
        email: user?.email || 'Unknown',
        enrolled_at: enrollment.enrolled_at,
        progress: parseFloat(enrollment.progress || 0),
        status: enrollment.status,
        last_accessed_at: lastAccessMap.get(enrollment.talenta_id) || enrollment.enrolled_at
      };
    });

    return NextResponse.json({
      success: true,
      data: participants
    });
  } catch (error: any) {
    console.error('Participants API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
