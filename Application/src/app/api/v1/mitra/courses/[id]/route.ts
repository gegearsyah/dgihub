/**
 * GET /api/v1/mitra/courses/[id]
 * Get course details
 * PUT /api/v1/mitra/courses/[id]
 * Update course
 * DELETE /api/v1/mitra/courses/[id]
 * Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

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

    const { id } = await params;
    const courseId = id;

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

    // Get course
    const { data: course, error } = await db
      .from('kursus')
      .select('*')
      .eq('kursus_id', courseId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course
    });
  } catch (error: any) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const { id } = await params;
    const courseId = id;
    const body = await request.json();

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
    const { data: existingCourse } = await db
      .from('kursus')
      .select('kursus_id')
      .eq('kursus_id', courseId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found or unauthorized' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.durationHours !== undefined) updateData.duration_hours = parseInt(body.durationHours);
    if (body.durationDays !== undefined) updateData.duration_days = parseInt(body.durationDays);
    if (body.price !== undefined) updateData.price = parseFloat(body.price) || 0;
    if (body.aqrfLevel !== undefined) updateData.aqrf_level = body.aqrfLevel ? parseInt(body.aqrfLevel) : null;
    if (body.skkniCode !== undefined) updateData.skkni_code = body.skkniCode || null;
    if (body.skkniName !== undefined) updateData.skkni_name = body.skkniName || null;
    if (body.deliveryMode !== undefined) updateData.delivery_mode = body.deliveryMode;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Check if course is being published for the first time
      const { data: currentCourse } = await db
        .from('kursus')
        .select('published_at')
        .eq('kursus_id', courseId)
        .single();
      
      if (body.status === 'PUBLISHED' && !currentCourse?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Update course
    const { data: course, error } = await db
      .from('kursus')
      .update(updateData)
      .eq('kursus_id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Course update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update course', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error: any) {
    console.error('Course update API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const { id } = await params;
    const courseId = id;

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
    const { data: existingCourse } = await db
      .from('kursus')
      .select('kursus_id')
      .eq('kursus_id', courseId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete course (cascade will handle related records)
    const { error } = await db
      .from('kursus')
      .delete()
      .eq('kursus_id', courseId);

    if (error) {
      console.error('Course deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete course', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error: any) {
    console.error('Course deletion API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
