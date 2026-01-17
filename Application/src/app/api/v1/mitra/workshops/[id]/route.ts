/**
 * PUT /api/v1/mitra/workshops/[id]
 * Update workshop
 * DELETE /api/v1/mitra/workshops/[id]
 * Delete workshop
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;

    // Check authorization
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const { id: workshopId } = await params;
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      locationName,
      city,
      province,
      address,
      latitude,
      longitude,
      capacity,
      price,
      status
    } = body;

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

    // Verify workshop belongs to this mitra
    const { data: existingWorkshop } = await db
      .from('workshops')
      .select('workshop_id, mitra_id')
      .eq('workshop_id', workshopId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (!existingWorkshop) {
      return NextResponse.json(
        { success: false, message: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate || startDate;
    if (startTime !== undefined) updateData.start_time = startTime || null;
    if (endTime !== undefined) updateData.end_time = endTime || null;
    if (locationName !== undefined) updateData.location_name = locationName;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province || null;
    if (address !== undefined) updateData.address = address || null;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (price !== undefined) updateData.price = parseFloat(price) || 0;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    // Update workshop
    const { data: workshop, error } = await db
      .from('workshops')
      .update(updateData)
      .eq('workshop_id', workshopId)
      .select()
      .single();

    if (error) {
      console.error('Workshop update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update workshop', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workshop updated successfully',
      data: workshop
    });
  } catch (error: any) {
    console.error('Workshop update API error:', error);
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

    // Check authorization
    const authError = authorizeUserType(user, 'MITRA');
    if (authError) return authError;

    const { id: workshopId } = await params;

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

    // Verify workshop belongs to this mitra
    const { data: existingWorkshop } = await db
      .from('workshops')
      .select('workshop_id, mitra_id')
      .eq('workshop_id', workshopId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (!existingWorkshop) {
      return NextResponse.json(
        { success: false, message: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Delete workshop (cascade will handle related records)
    const { error } = await db
      .from('workshops')
      .delete()
      .eq('workshop_id', workshopId);

    if (error) {
      console.error('Workshop deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete workshop', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workshop deleted successfully'
    });
  } catch (error: any) {
    console.error('Workshop deletion API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
