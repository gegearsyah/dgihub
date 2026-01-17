/**
 * GET /api/v1/talenta/courses
 * Fetch available courses for learners
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const skkniCode = searchParams.get('skkniCode');
    const aqrfLevel = searchParams.get('aqrfLevel');
    const provider = searchParams.get('provider');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('kursus')
      .select(`
        *,
        mitra_profiles!inner(organization_name, profile_id),
        enrollments!left(enrollment_id, status)
      `)
      .eq('status', 'PUBLISHED')
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (skkniCode) {
      query = query.eq('skkni_code', skkniCode);
    }

    if (aqrfLevel) {
      query = query.eq('aqrf_level', parseInt(aqrfLevel));
    }

    if (provider) {
      query = query.eq('mitra_id', provider);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Courses fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('kursus')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED');

    // Transform courses to include provider name and enrollment status
    const transformedCourses = courses?.map((course: any) => {
      const providerName = course.mitra_profiles?.organization_name || 'Unknown Provider';
      const isEnrolled = course.enrollments && course.enrollments.length > 0;
      
      return {
        kursus_id: course.kursus_id,
        title: course.title,
        description: course.description,
        duration_hours: course.duration_hours,
        duration_days: course.duration_days,
        price: parseFloat(course.price || 0),
        skkni_code: course.skkni_code,
        aqrf_level: course.aqrf_level,
        delivery_mode: course.delivery_mode || 'ONLINE',
        provider_name: providerName,
        provider_id: course.mitra_profiles?.profile_id,
        is_enrolled: isEnrolled,
        status: course.status,
        created_at: course.created_at
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        courses: transformedCourses,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

