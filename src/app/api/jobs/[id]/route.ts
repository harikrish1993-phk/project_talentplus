// ============================================================================
// Single Job API - GET, PUT, DELETE
// Path: app/api/jobs/[id]/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob, deleteJob } from '@/lib/db/jobs';
import { jobUpdateSchema } from '@/lib/validation/job-schema';
import { z } from 'zod';

// ============================================================================
// GET /api/jobs/[id] - Get single job
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: job,
    });
    
  } catch (error: any) {
    console.error(`GET /api/jobs/${params.id} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/jobs/[id] - Update job
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate input (partial update allowed)
    const validatedData = jobUpdateSchema.parse(body);
    
    // Check if job exists
    const existingJob = await getJob(params.id);
    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }
    
    // Update job
    const updatedJob = await updateJob(params.id, validatedData);
    
    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully',
    });
    
  } catch (error: any) {
    console.error(`PUT /api/jobs/${params.id} error:`, error);
    
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
        error: 'Failed to update job',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/jobs/[id] - Delete job (soft delete)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if job exists
    const existingJob = await getJob(params.id);
    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      );
    }
    
    // Soft delete (change status to cancelled)
    await deleteJob(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
    
  } catch (error: any) {
    console.error(`DELETE /api/jobs/${params.id} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete job',
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
        'Allow': 'GET, PUT, DELETE, OPTIONS',
      },
    }
  );
}
