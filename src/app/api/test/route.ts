/**
 * Test route to verify API routes work on Vercel
 * GET /api/test
 * POST /api/test
 */

import { NextRequest, NextResponse } from 'next/server';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test route works! API routes are functioning.',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      message: 'POST method works!',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: 'POST method works!',
      timestamp: new Date().toISOString()
    });
  }
}




