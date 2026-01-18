/**
 * GET /api/v1/talenta/my-courses
 * Get enrolled courses for learner
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Get enrollments with course details
    const { data: enrollments, error: enrollmentsError } = await db
      .from('enrollments')
      .select('*')
      .eq('talenta_id', talentaProfile.profile_id);

    if (enrollmentsError) {
      console.error('Enrollments fetch error:', enrollmentsError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get course IDs
    const kursusIds = enrollments.map((e: any) => e.kursus_id).filter(Boolean);

    // Fetch course details with mitra profiles
    const { data: courses, error: coursesError } = await db
      .from('kursus')
      .select(`
        *,
        mitra_profiles!left (
          profile_id,
          organization_name
        )
      `)
      .in('kursus_id', kursusIds);

    if (coursesError) {
      console.error('Courses fetch error:', coursesError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch course details' },
        { status: 500 }
      );
    }

    // Get materials count for each course
    const { data: materialsCount, error: materialsError } = await db
      .from('materi')
      .select('kursus_id')
      .in('kursus_id', kursusIds);

    // Count materials per course
    const materialsCountMap: Record<string, number> = {};
    if (materialsCount) {
      materialsCount.forEach((m: any) => {
        materialsCountMap[m.kursus_id] = (materialsCountMap[m.kursus_id] || 0) + 1;
      });
    }

    // Combine enrollment data with course details
    const enrichedEnrollments = enrollments.map((enrollment: any) => {
      const course = courses?.find((c: any) => c.kursus_id === enrollment.kursus_id);
      const mitraProfile = course?.mitra_profiles;
      
      return {
        // Enrollment fields
        enrollment_id: enrollment.id || enrollment.enrollment_id,
        id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        status: enrollment.status || 'ENROLLED',
        progress: parseFloat(enrollment.progress || 0),
        completed_at: enrollment.completed_at,
        certificate_issued: enrollment.certificate_issued || false,
        last_accessed_at: enrollment.last_accessed_at,
        payment_status: enrollment.payment_status,
        payment_method: enrollment.payment_method,
        payment_amount: enrollment.payment_amount,
        
        // Course fields
        kursus_id: course?.kursus_id || enrollment.kursus_id,
        title: course?.title || 'Untitled Course',
        description: course?.description || '',
        description_en: course?.description_en,
        category: course?.category,
        skkni_code: course?.skkni_code,
        skkni_name: course?.skkni_name,
        aqrf_level: course?.aqrf_level,
        duration_hours: course?.duration_hours || 0,
        duration_days: course?.duration_days,
        price: parseFloat(course?.price || 0),
        currency: course?.currency || 'IDR',
        delivery_mode: course?.delivery_mode,
        course_status: course?.status,
        published_at: course?.published_at,
        created_at: course?.created_at,
        
        // Provider info
        provider_name: mitraProfile?.organization_name || 'Unknown Provider',
        mitra_id: course?.mitra_id,
        
        // Additional info
        materials_count: materialsCountMap[enrollment.kursus_id] || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedEnrollments
    });
  } catch (error: any) {
    console.error('My courses API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


