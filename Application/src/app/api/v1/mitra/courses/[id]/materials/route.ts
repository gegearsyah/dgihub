/**
 * GET /api/v1/mitra/courses/[id]/materials
 * Get materials for a course
 * POST /api/v1/mitra/courses/[id]/materials
 * Create/upload material for a course
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

    const { id: courseId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Verify course ownership - try both possible column names
    let course;
    const { data: course1 } = await db
      .from('courses')
      .select('mitra_id, kursus_id')
      .eq('kursus_id', courseId)
      .single();
    
    if (!course1) {
      const { data: course2 } = await db
        .from('courses')
        .select('mitra_id, course_id')
        .eq('course_id', courseId)
        .single();
      course = course2;
    } else {
      course = course1;
    }

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get mitra profile
    const { data: mitraProfile } = await db
      .from('mitra_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (course.mitra_id !== mitraProfile?.profile_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get materials
    const { data: materials, error } = await db
      .from('materi')
      .select('*')
      .eq('kursus_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Materials fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch materials' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: materials || []
    });
  } catch (error: any) {
    console.error('Materials API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const body = await request.json();
    const {
      title,
      description,
      materialType,
      fileUrl,
      fileSize,
      fileType,
      thumbnailUrl,
      moduleNumber,
      lessonNumber,
      orderIndex,
      durationSeconds,
      isPreview,
      requiresCompletion,
      quizData // For QUIZ type materials
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Verify course ownership - try both possible column names
    let course;
    const { data: course1 } = await db
      .from('courses')
      .select('mitra_id, kursus_id')
      .eq('kursus_id', courseId)
      .single();
    
    if (!course1) {
      const { data: course2 } = await db
        .from('courses')
        .select('mitra_id, course_id')
        .eq('course_id', courseId)
        .single();
      course = course2;
    } else {
      course = course1;
    }

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get mitra profile
    const { data: mitraProfile } = await db
      .from('mitra_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (course.mitra_id !== mitraProfile?.profile_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create material
    const materialData: any = {
      kursus_id: courseId,
      title,
      description,
      material_type: materialType,
      file_url: fileUrl,
      file_size: fileSize,
      file_type: fileType,
      thumbnail_url: thumbnailUrl,
      module_number: moduleNumber,
      lesson_number: lessonNumber,
      order_index: orderIndex || 0,
      duration_seconds: durationSeconds,
      is_preview: isPreview || false,
      requires_completion: requiresCompletion !== false,
      status: 'ACTIVE'
    };

    const { data: material, error } = await db
      .from('materi')
      .insert(materialData)
      .select()
      .single();

    if (error) {
      console.error('Material creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create material' },
        { status: 500 }
      );
    }

    // If it's a quiz, create quiz questions
    if (materialType === 'QUIZ' && quizData && quizData.questions) {
      // Store quiz data in a separate table or as JSON
      // For now, we'll store it in a quiz_questions table (you may need to create this)
      // Or store in material description as JSON
      const { error: quizError } = await db
        .from('materi')
        .update({
          description: JSON.stringify(quizData)
        })
        .eq('materi_id', material.materi_id);

      if (quizError) {
        console.error('Quiz data save error:', quizError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Material created successfully',
      data: material
    }, { status: 201 });
  } catch (error: any) {
    console.error('Material creation API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
