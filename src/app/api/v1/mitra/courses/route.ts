/**
 * GET /api/v1/mitra/courses
 * Get courses for training provider
 * POST /api/v1/mitra/courses
 * Create new course
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
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

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

    // Get courses
    const { data: courses, error } = await db
      .from('courses')
      .select('*')
      .eq('mitra_id', mitraProfile.profile_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Courses fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: courses || []
    });
  } catch (error: any) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;

    // Check authorization
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const body = await request.json();
    const { title, description, category, durationHours, skkniCode } = body;

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

    // Create course
    const { data: course, error } = await db
      .from('courses')
      .insert({
        mitra_id: mitraProfile.profile_id,
        title,
        description,
        category,
        duration_hours: durationHours,
        skkni_code: skkniCode,
        status: 'DRAFT'
      })
      .select()
      .single();

    if (error) {
      console.error('Course creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      data: course
    }, { status: 201 });
  } catch (error: any) {
    console.error('Course creation API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


