/**
 * POST /api/v1/talenta/materials/[id]/progress
 * Update material progress (for videos, documents, etc.)
 * PUT /api/v1/talenta/materials/[id]/progress
 * Get material progress
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
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const { id: materialId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get progress
    const { data: progress, error } = await db
      .from('material_completions')
      .select('*')
      .eq('materi_id', materialId)
      .eq('talenta_id', user.userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Progress fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress || {
        progress_percentage: 0,
        last_position: 0,
        time_spent_seconds: 0,
        completed_at: null
      }
    });
  } catch (error: any) {
    console.error('Progress fetch API error:', error);
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
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const { id: materialId } = await params;
    const body = await request.json();
    const { progressPercentage, lastPosition, timeSpentSeconds, markComplete } = body;

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

    // Check if progress exists
    const { data: existing } = await db
      .from('material_completions')
      .select('*')
      .eq('materi_id', materialId)
      .eq('talenta_id', user.userId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (progressPercentage !== undefined) {
      updateData.progress_percentage = Math.min(100, Math.max(0, parseFloat(progressPercentage)));
    }
    if (lastPosition !== undefined) {
      updateData.last_position = parseInt(lastPosition);
    }
    if (timeSpentSeconds !== undefined) {
      updateData.time_spent_seconds = parseInt(timeSpentSeconds);
    }
    if (markComplete || (progressPercentage !== undefined && progressPercentage >= 100)) {
      updateData.completed_at = new Date().toISOString();
      updateData.progress_percentage = 100;
    }

    let result;
    if (existing) {
      // Update existing progress
      const { data: updated, error } = await db
        .from('material_completions')
        .update(updateData)
        .eq('materi_id', materialId)
        .eq('talenta_id', user.userId)
        .select()
        .single();

      if (error) {
        console.error('Progress update error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to update progress' },
          { status: 500 }
        );
      }
      result = updated;
    } else {
      // Create new progress record
      const { data: created, error } = await db
        .from('material_completions')
        .insert({
          materi_id: materialId,
          talenta_id: user.userId,
          progress_percentage: progressPercentage || 0,
          last_position: lastPosition || 0,
          time_spent_seconds: timeSpentSeconds || 0,
          completed_at: markComplete || (progressPercentage >= 100) ? new Date().toISOString() : null,
          ...updateData
        })
        .select()
        .single();

      if (error) {
        console.error('Progress creation error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to save progress' },
          { status: 500 }
        );
      }
      result = created;
    }

    return NextResponse.json({
      success: true,
      message: 'Progress updated',
      data: result
    });
  } catch (error: any) {
    console.error('Progress update API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
