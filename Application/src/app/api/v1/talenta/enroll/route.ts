/**
 * POST /api/v1/talenta/enroll
 * Enroll in a course with payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const body = await request.json();
    const { kursusId, paymentMethod, paymentData } = body;

    if (!kursusId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
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

    // Get course details
    const { data: course, error: courseError } = await db
      .from('kursus')
      .select('kursus_id, title, price, status')
      .eq('kursus_id', kursusId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, message: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await db
      .from('enrollments')
      .select('id, status')
      .eq('talenta_id', talentaProfile.profile_id)
      .eq('kursus_id', kursusId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ENROLLED' || existingEnrollment.status === 'COMPLETED') {
        return NextResponse.json(
          { success: false, message: 'Already enrolled in this course' },
          { status: 400 }
        );
      }
    }

    // Process payment (mock payment gateway)
    const coursePrice = parseFloat(course.price || 0);
    let paymentStatus = 'PENDING';
    let paymentId = null;

    if (coursePrice > 0) {
      // Mock payment processing
      if (paymentMethod && paymentData) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock payment gateway response
        // In real implementation, this would call actual payment gateway API
        const mockPaymentSuccess = Math.random() > 0.1; // 90% success rate for demo
        
        if (mockPaymentSuccess) {
          paymentStatus = 'PAID';
          paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        } else {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Payment failed. Please try again.',
              paymentStatus: 'FAILED'
            },
            { status: 402 }
          );
        }
      } else {
        // Free course or payment not provided
        if (coursePrice === 0) {
          paymentStatus = 'FREE';
        } else {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Payment required for this course',
              requiresPayment: true,
              amount: coursePrice
            },
            { status: 402 }
          );
        }
      }
    } else {
      paymentStatus = 'FREE';
    }

    // Create enrollment
    const enrollmentData: any = {
      talenta_id: talentaProfile.profile_id,
      kursus_id: kursusId,
      status: 'ENROLLED',
      enrolled_at: new Date().toISOString(),
      progress: 0
    };

    // Add payment info if paid (only if columns exist)
    if (paymentStatus === 'PAID' && paymentId) {
      // Check if payment columns exist before adding
      enrollmentData.payment_id = paymentId;
      enrollmentData.payment_status = paymentStatus;
      enrollmentData.payment_method = paymentMethod;
      enrollmentData.payment_amount = coursePrice;
      enrollmentData.paid_at = new Date().toISOString();
    } else if (paymentStatus === 'FREE') {
      // Set payment_status to FREE for free courses
      enrollmentData.payment_status = 'FREE';
      enrollmentData.payment_amount = 0;
    }

    console.log('Creating enrollment with data:', JSON.stringify(enrollmentData, null, 2));

    const { data: enrollment, error: enrollmentError } = await db
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) {
      // Handle unique constraint violation (already enrolled)
      if (enrollmentError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Already enrolled in this course' },
          { status: 400 }
        );
      }

      // Handle column doesn't exist error
      if (enrollmentError.code === '42703' || enrollmentError.message?.includes('column') || enrollmentError.message?.includes('does not exist')) {
        console.error('Payment columns may not exist. Attempting enrollment without payment fields...');
        // Try again without payment fields
        const basicEnrollmentData = {
          talenta_id: talentaProfile.profile_id,
          kursus_id: kursusId,
          status: 'ENROLLED',
          enrolled_at: new Date().toISOString(),
          progress: 0
        };

        const { data: basicEnrollment, error: basicError } = await db
          .from('enrollments')
          .insert(basicEnrollmentData)
          .select()
          .single();

        if (basicError) {
          console.error('Basic enrollment error:', basicError);
          return NextResponse.json(
            { 
              success: false, 
              message: 'Failed to create enrollment. Please run migration 012_add_payment_fields_to_enrollments.sql',
              error: basicError.message 
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully enrolled in course (payment fields not available)',
          data: {
            enrollment: basicEnrollment,
            payment: {
              status: paymentStatus,
              paymentId,
              amount: coursePrice
            }
          }
        }, { status: 201 });
      }

      console.error('Enrollment error:', enrollmentError);
      console.error('Error code:', enrollmentError.code);
      console.error('Error message:', enrollmentError.message);
      console.error('Error details:', enrollmentError.details);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create enrollment', 
          error: enrollmentError.message,
          errorCode: enrollmentError.code,
          errorDetails: enrollmentError.details
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment,
        payment: {
          status: paymentStatus,
          paymentId,
          amount: coursePrice
        }
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}
