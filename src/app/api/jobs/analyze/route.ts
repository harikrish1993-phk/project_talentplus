// ============================================================================
// AI Job Analysis API
// Path: app/api/jobs/analyze/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/ai/job-analyzer';
import { z } from 'zod';

// ============================================================================
// Request schema
// ============================================================================

const analyzeRequestSchema = z.object({
  description: z.string().min(100, 'Description must be at least 100 characters'),
  provider: z.enum(['openai', 'anthropic']).optional(),
});

// ============================================================================
// POST /api/jobs/analyze - Analyze job description with AI
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { description, provider } = analyzeRequestSchema.parse(body);
    
    // Analyze with AI
    const result = await analyzeJobDescription(description, provider);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis failed',
          message: result.error,
          confidence: 0,
          extraction_method: result.extraction_method,
        },
        { status: 422 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.confidence,
      extraction_method: result.extraction_method,
      message: `Analysis complete with ${Math.round(result.confidence * 100)}% confidence`,
    });
    
  } catch (error: any) {
    console.error('POST /api/jobs/analyze error:', error);
    
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
        error: 'Analysis failed',
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
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}
