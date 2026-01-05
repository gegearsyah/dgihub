/**
 * API Helper Functions
 * Common utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireUserType } from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

/**
 * Authenticate request and get user
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: any; response?: NextResponse } | null> {
  const user = await getUserFromRequest(request.headers);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  return { user };
}

/**
 * Check user type authorization
 */
export function authorizeUserType(
  user: any,
  ...allowedTypes: string[]
): NextResponse | null {
  if (!requireUserType(user, ...allowedTypes)) {
    return NextResponse.json(
      {
        success: false,
        message: `Access denied. Required user type: ${allowedTypes.join(' or ')}`
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Handle API errors
 */
export function handleApiError(error: any, message = 'An error occurred') {
  console.error('API Error:', error);
  return NextResponse.json(
    {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    { status: 500 }
  );
}


