/**
 * GET /api/v1/talenta/courses
 * Fetch available courses for learners
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
      .from('courses')
      .select(`
        *,
        mitra_profiles!inner(organization_name, profile_id)
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
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED');

    return NextResponse.json({
      success: true,
      data: {
        courses: courses || [],
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

