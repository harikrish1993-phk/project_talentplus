// ============================================================================
// Candidates API - Parse Resume
// Path: app/api/candidates/parse/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/ai/resume-parser';
import { resumeParseSchema } from '@/lib/validation/candidate-schema';

// ============================================================================
// POST /api/candidates/parse - Parse resume with AI
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = resumeParseSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { resume_text, provider } = validation.data;
    
    // Parse resume with AI
    const result = await parseResume(resume_text, provider);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse resume',
          message: result.error,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.confidence,
      extraction_method: result.extraction_method,
      message: 'Resume parsed successfully',
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse resume',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}