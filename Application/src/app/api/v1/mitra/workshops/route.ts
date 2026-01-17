/**
 * GET /api/v1/mitra/workshops
 * Get workshops for training provider
 * POST /api/v1/mitra/workshops
 * Create new workshop
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Get workshops
    const { data: workshops, error } = await db
      .from('workshops')
      .select('*')
      .eq('mitra_id', mitraProfile.profile_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Workshops fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch workshops' },
        { status: 500 }
      );
    }

    // Get registration counts for each workshop
    const workshopIds = (workshops || []).map((w: any) => w.workshop_id);
    let registrationCounts: Record<string, number> = {};
    
    if (workshopIds.length > 0) {
      const { data: registrations } = await db
        .from('workshop_registrations')
        .select('workshop_id')
        .in('workshop_id', workshopIds)
        .eq('status', 'CONFIRMED');
      
      // Count registrations per workshop
      registrationCounts = (registrations || []).reduce((acc: Record<string, number>, reg: any) => {
        acc[reg.workshop_id] = (acc[reg.workshop_id] || 0) + 1;
        return acc;
      }, {});
    }

    // Format workshops with registration count
    const formattedWorkshops = (workshops || []).map((workshop: any) => ({
      ...workshop,
      registered_count: registrationCounts[workshop.workshop_id] || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedWorkshops
    });
  } catch (error: any) {
    console.error('Workshops API error:', error);
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
      kursusId
    } = body;

    // Validation
    if (!title || !description || !startDate || !locationName || !city || !capacity) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Parse dates - use DATE type for start_date and end_date
    // Times are stored separately as TIME type
    const startDateValue = startDate; // Keep as date string (YYYY-MM-DD)
    const endDateValue = endDate || startDate; // Use startDate if endDate not provided

    // Create workshop (kursus_id column doesn't exist in workshops table)
    const workshopData: any = {
      mitra_id: mitraProfile.profile_id,
      title,
      description,
      start_date: startDateValue,
      end_date: endDateValue,
      start_time: startTime || null,
      end_time: endTime || null,
      location_name: locationName,
      city,
      province: province || null,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      capacity: parseInt(capacity),
      status: 'DRAFT'
    };

    // Add price if column exists (check via migration)
    if (price !== undefined && price !== null) {
      workshopData.price = parseFloat(price) || 0;
    }

    const { data: workshop, error } = await db
      .from('workshops')
      .insert(workshopData)
      .select()
      .single();

    if (error) {
      console.error('Workshop creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create workshop', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workshop created successfully',
      data: workshop
    }, { status: 201 });
  } catch (error: any) {
    console.error('Workshop creation API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
