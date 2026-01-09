/**
 * Next.js Middleware
 * Handles CORS and request processing
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // CORS headers
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow Vercel deployments
    const isVercel = origin?.includes('vercel.app') || origin?.includes('vercel.sh');
    const isAllowed = origin && (allowedOrigins.includes(origin) || isVercel);

    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (isVercel) {
      // For Vercel, allow the origin
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};


