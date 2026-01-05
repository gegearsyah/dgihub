/**
 * GET /api/v1/industri/jobs
 * Get job postings for employer
 * POST /api/v1/industri/jobs
 * Create new job posting
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
    const authError = authorizeUserType(user, 'INDUSTRI');
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get industri profile
    const { data: industriProfile } = await db
      .from('industri_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (!industriProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get job postings
    const { data: jobs, error } = await db
      .from('job_postings')
      .select('*')
      .eq('industri_id', industriProfile.profile_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Jobs fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jobs || []
    });
  } catch (error: any) {
    console.error('Jobs API error:', error);
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
    const authError = authorizeUserType(user, 'INDUSTRI');
    if (authError) return authError;

    const body = await request.json();
    const {
      title,
      description,
      location,
      city,
      province,
      salaryMin,
      salaryMax,
      requirements
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get industri profile
    const { data: industriProfile } = await db
      .from('industri_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (!industriProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Create job posting
    const { data: job, error } = await db
      .from('job_postings')
      .insert({
        industri_id: industriProfile.profile_id,
        title,
        description,
        location,
        city,
        province,
        salary_min: salaryMin,
        salary_max: salaryMax,
        status: 'DRAFT'
      })
      .select()
      .single();

    if (error) {
      console.error('Job creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    }, { status: 201 });
  } catch (error: any) {
    console.error('Job creation API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


