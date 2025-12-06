// ============================================================================
// Dashboard Stats API
// Path: app/api/dashboard/stats/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getDashboardStats,
  getRecruiterStats,
  getTeamLeadStats,
  getOwnerStats,
} from '@/lib/db/dashboard';

// ============================================================================
// GET /api/dashboard/stats - Get dashboard statistics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get role from query params (in real app, get from auth session)
    const role = searchParams.get('role') || 'recruiter';
    const userId = searchParams.get('user_id'); // In real app, get from session
    
    let stats;
    
    switch (role) {
      case 'owner':
      case 'admin':
        stats = await getOwnerStats();
        break;
        
      case 'team_lead':
        if (!userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'User ID required for team lead stats',
            },
            { status: 400 }
          );
        }
        stats = await getTeamLeadStats(userId);
        break;
        
      case 'recruiter':
        if (!userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'User ID required for recruiter stats',
            },
            { status: 400 }
          );
        }
        stats = await getRecruiterStats(userId);
        break;
        
      default:
        stats = await getDashboardStats();
    }
    
    return NextResponse.json({
      success: true,
      data: stats,
      role,
    });
    
  } catch (error: any) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
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