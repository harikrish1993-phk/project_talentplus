// ============================================================================
// Rate Limiting Middleware
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '../errors/error-handler';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (IP address or user ID)
    const identifier = getIdentifier(request);
    const now = Date.now();
    const key = `${identifier}:${config.windowMs}`;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      entry = {
        count: 1,
        resetAt: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
      return null; // Allow request
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: config.message || 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
          },
        }
      );
    }

    // Update entry
    rateLimitStore.set(key, entry);

    // Return null to allow request (add rate limit headers to response later)
    return null;
  };
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from headers (set by auth middleware)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}

// ============================================================================
// Predefined Rate Limiters
// ============================================================================

// General API rate limiter (60 requests per minute)
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  message: 'Too many requests. Please slow down.',
});

// Strict rate limiter for auth endpoints (5 requests per minute)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again later.',
});

// AI rate limiter (based on hourly limit)
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: parseInt(process.env.RATE_LIMIT_AI_REQUESTS_PER_HOUR || '100'),
  message: 'AI request limit exceeded. Please try again later or upgrade your plan.',
});

// ============================================================================
// Rate Limit Headers Helper
// ============================================================================

export function addRateLimitHeaders(
  response: NextResponse,
  config: RateLimitConfig,
  identifier: string
): NextResponse {
  const key = `${identifier}:${config.windowMs}`;
  const entry = rateLimitStore.get(key);

  if (entry) {
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, config.maxRequests - entry.count).toString()
    );
    response.headers.set('X-RateLimit-Reset', entry.resetAt.toString());
  }

  return response;
}
