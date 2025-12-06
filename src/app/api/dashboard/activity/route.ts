// ============================================================================
// Dashboard Activity API
// Path: app/api/dashboard/activity/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, getPipelineStats } from '@/lib/db/dashboard';

// ============================================================================
// GET /api/dashboard/activity - Get recent activity feed
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'activity' or 'pipeline'
    
    if (type === 'pipeline') {
      // Get pipeline stats for charts
      const pipelineData = await getPipelineStats();
      
      return NextResponse.json({
        success: true,
        data: pipelineData,
        type: 'pipeline',
      });
    }
    
    // Get recent activity
    const activities = await getRecentActivity(limit);
    
    return NextResponse.json({
      success: true,
      data: activities,
      count: activities.length,
      type: 'activity',
    });
    
  } catch (error: any) {
    console.error('GET /api/dashboard/activity error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch activity',
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
        'Allow': 'GET, OPTIONS',
      },
    }
  );
}