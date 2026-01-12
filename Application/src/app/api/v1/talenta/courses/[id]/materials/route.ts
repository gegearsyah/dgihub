/**
 * GET /api/v1/talenta/courses/[id]/materials
 * Get materials for enrolled course
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const courseId = params.id;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Verify enrollment
    const { data: enrollment } = await db
      .from('enrollments')
      .select('*')
      .eq('kursus_id', courseId)
      .eq('talenta_id', user.userId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Get materials
    const { data: materials, error } = await db
      .from('materi')
      .select('*')
      .eq('kursus_id', courseId)
      .eq('status', 'ACTIVE')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Materials fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch materials' },
        { status: 500 }
      );
    }

    // Get completion status for each material
    const { data: completions } = await db
      .from('material_completions')
      .select('materi_id, completed_at')
      .eq('talenta_id', user.userId)
      .in('materi_id', materials?.map((m: any) => m.materi_id) || []);

    const completionMap = new Map(
      completions?.map((c: any) => [c.materi_id, c.completed_at]) || []
    );

    // Add completion status to materials
    const materialsWithStatus = materials?.map((material: any) => ({
      ...material,
      completed: completionMap.has(material.materi_id),
      completedAt: completionMap.get(material.materi_id)
    })) || [];

    return NextResponse.json({
      success: true,
      data: materialsWithStatus
    });
  } catch (error: any) {
    console.error('Materials API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
