/**
 * GET /api/v1/mitra/workshops/[id]/attendance
 * Get workshop attendance for Mitra
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
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
    const { data: workshop, error: workshopError } = await db
      .from('workshops')
      .select('workshop_id, title')
      .eq('workshop_id', workshopId)
      .eq('mitra_id', mitraProfile.profile_id)
      .single();

    if (workshopError || !workshop) {
      return NextResponse.json(
        { success: false, message: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Get all registrations for this workshop
    const { data: registrations, error: regError } = await db
      .from('workshop_registrations')
      .select(`
        registration_id,
        talenta_id,
        registered_at,
        status
      `)
      .eq('workshop_id', workshopId);

    if (regError) {
      console.error('Registrations fetch error:', regError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch registrations' },
        { status: 500 }
      );
    }

    // Get attendance records
    const registrationIds = (registrations || []).map((r: any) => r.registration_id);
    let attendanceData: any[] = [];

    if (registrationIds.length > 0) {
      const { data: attendance, error: attError } = await db
        .from('workshop_attendance')
        .select('*')
        .in('registration_id', registrationIds)
        .order('attendance_timestamp', { ascending: false });

      if (!attError && attendance) {
        attendanceData = attendance;
      }
    }

    // Get user details for each registration
    const talentaIds = (registrations || []).map((r: any) => r.talenta_id);
    let userDetails: Record<string, any> = {};

    if (talentaIds.length > 0) {
      const { data: profiles } = await db
        .from('talenta_profiles')
        .select('profile_id, user_id')
        .in('profile_id', talentaIds);

      if (profiles && profiles.length > 0) {
        const userIds = profiles.map((p: any) => p.user_id);
        const { data: users } = await db
          .from('users')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        // Create mapping
        profiles.forEach((profile: any) => {
          const user = users?.find((u: any) => u.user_id === profile.user_id);
          if (user) {
            userDetails[profile.profile_id] = user;
          }
        });
      }
    }

    // Combine registration and attendance data
    const attendanceList = (registrations || []).map((reg: any) => {
      const user = userDetails[reg.talenta_id];
      const attendance = attendanceData.find(
        (att: any) => att.registration_id === reg.registration_id
      );

      return {
        registration_id: reg.registration_id,
        talenta_id: reg.talenta_id,
        full_name: user?.full_name || 'Unknown',
        email: user?.email || 'Unknown',
        registered_at: reg.registered_at,
        registration_status: reg.status,
        attendance: attendance ? {
          attendance_id: attendance.attendance_id,
          attendance_timestamp: attendance.attendance_timestamp,
          latitude: attendance.latitude,
          longitude: attendance.longitude,
          verified: attendance.verified,
          verification_method: attendance.verification_method
        } : null,
        has_attended: !!attendance
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        workshop: {
          workshop_id: workshop.workshop_id,
          title: workshop.title
        },
        attendance: attendanceList,
        summary: {
          total_registrations: attendanceList.length,
          attended: attendanceList.filter(a => a.has_attended).length,
          not_attended: attendanceList.filter(a => !a.has_attended).length
        }
      }
    });
  } catch (error: any) {
    console.error('Workshop attendance API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
