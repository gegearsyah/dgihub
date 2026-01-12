/**
 * POST /api/v1/talenta/workshops/[id]/attendance
 * Record workshop attendance with GPS verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

    const workshopId = params.id;
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'Location coordinates required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get workshop
    const { data: workshop } = await db
      .from('workshops')
      .select('*')
      .eq('workshop_id', workshopId)
      .single();

    if (!workshop) {
      return NextResponse.json(
        { success: false, message: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Check registration
    const { data: registration } = await db
      .from('workshop_registrations')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('talenta_id', user.userId)
      .single();

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Not registered for this workshop' },
        { status: 403 }
      );
    }

    // Verify location (if workshop has location)
    if (workshop.latitude && workshop.longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        workshop.latitude,
        workshop.longitude
      );

      const maxDistance = 100; // 100 meters
      if (distance > maxDistance) {
        return NextResponse.json({
          success: false,
          message: `You are ${Math.round(distance)}m away from the workshop location. Please move within ${maxDistance}m.`,
          data: { distance: Math.round(distance), maxDistance }
        }, { status: 400 });
      }
    }

    // Check if already recorded
    const { data: existing } = await db
      .from('workshop_attendance')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('talenta_id', user.userId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Attendance already recorded',
        data: existing
      });
    }

    // Record attendance
    const { data: attendance, error } = await db
      .from('workshop_attendance')
      .insert({
        workshop_id: workshopId,
        talenta_id: user.userId,
        latitude: latitude,
        longitude: longitude,
        recorded_at: new Date().toISOString(),
        status: 'PRESENT'
      })
      .select()
      .single();

    if (error) {
      console.error('Attendance recording error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance
    });
  } catch (error: any) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
