/**
 * GET /api/v1/talenta/certificates
 * Get certificates for learner
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;

    // Check authorization
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get talenta profile
    const { data: talentaProfile } = await db
      .from('talenta_profiles')
      .select('profile_id')
      .eq('user_id', user.userId)
      .single();

    if (!talentaProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get certificates with course information
    // Note: aqrf_level is on certificates table, not courses table
    const { data: certificates, error } = await db
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_date,
        expiration_date,
        aqrf_level,
        status,
        credential_url,
        course_id,
        mitra_id,
        courses:course_id (
          title,
          skkni_code
        )
      `)
      .eq('talenta_id', talentaProfile.profile_id)
      .order('issued_date', { ascending: false });

    if (error) {
      console.error('Certificates fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch certificates', error: error.message },
        { status: 500 }
      );
    }

    // Get issuer names for all unique mitra_ids
    const mitraIds = [...new Set((certificates || []).map((c: any) => c.mitra_id).filter(Boolean))];
    const issuerMap: Record<string, string> = {};
    
    if (mitraIds.length > 0) {
      const { data: mitraProfiles } = await db
        .from('mitra_profiles')
        .select('profile_id, organization_name')
        .in('profile_id', mitraIds);
      
      if (mitraProfiles) {
        mitraProfiles.forEach((mp: any) => {
          issuerMap[mp.profile_id] = mp.organization_name || 'Issuer';
        });
      }
    }

    // Transform the data to match frontend expectations
    const transformedCertificates = (certificates || []).map((cert: any) => {
      const course = Array.isArray(cert.courses) ? cert.courses[0] : cert.courses || {};
      
      return {
        sertifikat_id: cert.id,
        certificate_number: cert.certificate_number,
        credential_id: cert.credential_url || '',
        title: course.title || 'Certificate',
        course_title: course.title || null,
        issued_date: cert.issued_date,
        expiration_date: cert.expiration_date || null,
        skkni_code: course.skkni_code || null,
        aqrf_level: cert.aqrf_level ? (typeof cert.aqrf_level === 'string' ? parseInt(cert.aqrf_level) : cert.aqrf_level) : null,
        status: cert.status || 'ACTIVE',
        issuer_name: issuerMap[cert.mitra_id] || 'Issuer'
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCertificates
    });
  } catch (error: any) {
    console.error('Certificates API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}


