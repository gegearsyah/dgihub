/**
 * GET /api/v1/health
 * Health check endpoint
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          error: 'Database not configured',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    // Test database connection
    const { error } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

