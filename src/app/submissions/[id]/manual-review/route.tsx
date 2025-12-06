import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/submissions/[id]/manual-review
 * Submit or update manual review for a submission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { manual_score, manual_review_notes } = body;

    // Validation
    if (manual_score === undefined || manual_score === null) {
      return NextResponse.json(
        { error: 'Manual score is required' },
        { status: 400 }
      );
    }

    if (manual_score < 0 || manual_score > 100) {
      return NextResponse.json(
        { error: 'Manual score must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!manual_review_notes || manual_review_notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Review notes are required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if submission exists
    const { data: existingSubmission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, job_id, candidate_id, ai_score')
      .eq('id', submissionId)
      .single();

    if (fetchError || !existingSubmission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with manual review
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        manual_score,
        manual_reviewer_id: userId,
        manual_review_notes,
        manual_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json(
        { error: 'Failed to save review' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'manual_review_submitted',
        resource_type: 'submission',
        resource_id: submissionId,
        metadata: {
          ai_score: existingSubmission.ai_score,
          manual_score,
          score_difference: manual_score - (existingSubmission.ai_score || 0),
          job_id: existingSubmission.job_id,
          candidate_id: existingSubmission.candidate_id,
        },
      });
    } catch (logError) {
      // Log error but don't fail the request
      console.error('Failed to log activity:', logError);
    }

    // Calculate if AI should be retrained based on score difference
    const scoreDifference = Math.abs(
      manual_score - (existingSubmission.ai_score || 0)
    );
    const shouldRetrain = scoreDifference > 20; // Significant difference

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      meta: {
        score_difference: scoreDifference,
        should_retrain: shouldRetrain,
        message:
          shouldRetrain
            ? 'Your feedback will help improve AI accuracy'
            : 'Review submitted successfully',
      },
    });
  } catch (error) {
    console.error('Error in manual review endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions/[id]/manual-review
 * Get manual review for a submission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get submission with manual review data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select(
        `
        id,
        manual_score,
        manual_reviewer_id,
        manual_review_notes,
        manual_reviewed_at,
        ai_score,
        job:jobs(id, title),
        candidate:candidates(id, first_name, last_name),
        reviewer:users!manual_reviewer_id(id, full_name, email)
      `
      )
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      has_review: !!submission.manual_reviewed_at,
    });
  } catch (error) {
    console.error('Error fetching manual review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/submissions/[id]/manual-review
 * Remove manual review (if needed)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Clear manual review fields
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        manual_score: null,
        manual_reviewer_id: null,
        manual_review_notes: null,
        manual_reviewed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error removing review:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove review' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'manual_review_removed',
        resource_type: 'submission',
        resource_id: submissionId,
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    console.error('Error in manual review deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}