/**
 * POST /api/v1/talenta/materials/[id]/complete
 * Mark material as completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const materialId = params.id;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get material and verify enrollment
    const { data: material } = await db
      .from('materi')
      .select('kursus_id')
      .eq('materi_id', materialId)
      .single();

    if (!material) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    // Verify enrollment
    const { data: enrollment } = await db
      .from('enrollments')
      .select('*')
      .eq('kursus_id', material.kursus_id)
      .eq('talenta_id', user.userId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if already completed
    const { data: existing } = await db
      .from('material_completions')
      .select('*')
      .eq('materi_id', materialId)
      .eq('talenta_id', user.userId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Material already completed',
        data: existing
      });
    }

    // Mark as completed
    const { data: completion, error } = await db
      .from('material_completions')
      .insert({
        materi_id: materialId,
        talenta_id: user.userId,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Completion error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to mark material as completed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Material marked as completed',
      data: completion
    });
  } catch (error: any) {
    console.error('Material completion API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
