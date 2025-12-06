// ============================================================================
// Jobs API - GET (list) and POST (create)
// Path: app/api/jobs/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getJobs, createJob } from '@/lib/db/jobs';
import { jobSchema } from '@/lib/validation/job-schema';
import { z } from 'zod';

// ============================================================================
// GET /api/jobs - List jobs with filters
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const client_id = searchParams.get('client_id') || undefined;
    const location_type = searchParams.get('location_type') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc';
    
    // Parse skills array if provided
    const skillsParam = searchParams.get('skills');
    const skills = skillsParam ? skillsParam.split(',') : undefined;
    
    // Build filters
    const filters = {
      status,
      client_id,
      location_type,
      search,
      skills,
      sort_by,
      sort_order,
    };
    
    // Fetch jobs
    const result = await getJobs(filters, page, limit);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
    
  } catch (error: any) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/jobs - Create new job
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = jobSchema.parse(body);
    
    // Get user from session/auth (placeholder - you'll implement this)
    // For now, we'll use organization_id from body or get from auth
    const userId = body.created_by || 'system'; // Replace with actual auth
    const organizationId = body.organization_id; // Get from auth context
    
    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID is required',
        },
        { status: 400 }
      );
    }
    
    // Create job
    const job = await createJob({
      ...validatedData,
      organization_id: organizationId,
      created_by: userId,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: job,
        message: 'Job created successfully',
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('POST /api/jobs error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, POST, OPTIONS',
      },
    }
  );
}
