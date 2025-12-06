// ============================================================================
// Dashboard Database Operations
// ============================================================================
// Centralized stats and metrics for all dashboard types

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// Dashboard Stats Response Types
// ============================================================================

export interface DashboardStats {
  jobs: {
    total: number;
    open: number;
    closed: number;
    draft: number;
  };
  candidates: {
    total: number;
    active: number;
    placed: number;
    new_this_week: number;
  };
  submissions: {
    total: number;
    in_progress: number;
    submitted_to_client: number;
    interviewed: number;
    hired: number;
  };
  clients: {
    total: number;
    active: number;
  };
  revenue?: {
    this_month: number;
    last_month: number;
    growth_percentage: number;
  };
}

export interface RecruiterStats extends DashboardStats {
  my_jobs: number;
  my_submissions: number;
  my_placements_this_month: number;
  performance_score: number;
}

export interface TeamLeadStats extends DashboardStats {
  team_size: number;
  team_placements_this_month: number;
  team_revenue_this_month: number;
  top_performers: Array<{
    recruiter_name: string;
    placements: number;
  }>;
}

export interface OwnerStats extends DashboardStats {
  total_revenue_this_year: number;
  total_placements_this_year: number;
  active_recruiters: number;
  clients_added_this_month: number;
  avg_time_to_fill: number;
}

// ============================================================================
// Get Dashboard Stats (Universal)
// ============================================================================

export async function getDashboardStats(
  userId?: string,
  role?: string
): Promise<DashboardStats> {
  const supabase = createClient();

  try {
    // Get jobs stats
    const { data: jobs } = await supabase
      .from('jobs')
      .select('job_status');

    const jobStats = {
      total: jobs?.length || 0,
      open: jobs?.filter(j => j.job_status === 'open').length || 0,
      closed: jobs?.filter(j => j.job_status === 'closed').length || 0,
      draft: jobs?.filter(j => j.job_status === 'draft').length || 0,
    };

    // Get candidates stats
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, created_at, current_status');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const candidateStats = {
      total: candidates?.length || 0,
      active: candidates?.filter(c => c.current_status === 'active').length || 0,
      placed: candidates?.filter(c => c.current_status === 'placed').length || 0,
      new_this_week: candidates?.filter(c => 
        new Date(c.created_at) >= oneWeekAgo
      ).length || 0,
    };

    // Get submissions stats
    const { data: submissions } = await supabase
      .from('submissions')
      .select('status');

    const submissionStats = {
      total: submissions?.length || 0,
      in_progress: submissions?.filter(s => 
        ['new', 'pre_screening', 'internal_review'].includes(s.status)
      ).length || 0,
      submitted_to_client: submissions?.filter(s => 
        ['submitted_to_client', 'client_review'].includes(s.status)
      ).length || 0,
      interviewed: submissions?.filter(s => 
        ['interview_scheduled', 'interviewed'].includes(s.status)
      ).length || 0,
      hired: submissions?.filter(s => s.status === 'hired').length || 0,
    };

    // Get clients stats
    const { data: clients } = await supabase
      .from('clients')
      .select('id, relationship_status');

    const clientStats = {
      total: clients?.length || 0,
      active: clients?.filter(c => c.relationship_status === 'active').length || 0,
    };

    return {
      jobs: jobStats,
      candidates: candidateStats,
      submissions: submissionStats,
      clients: clientStats,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// ============================================================================
// Get Recruiter-Specific Stats
// ============================================================================

export async function getRecruiterStats(recruiterId: string): Promise<RecruiterStats> {
  const supabase = createClient();
  
  try {
    // Get base stats
    const baseStats = await getDashboardStats(recruiterId, 'recruiter');

    // Get jobs assigned to this recruiter
    const { data: myJobs } = await supabase
      .from('jobs')
      .select('id')
      .contains('recruiters', [recruiterId]);

    // Get submissions by this recruiter
    const { data: mySubmissions } = await supabase
      .from('submissions')
      .select('id, status, created_at')
      .eq('submitted_by', recruiterId);

    // Get placements this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const myPlacementsThisMonth = mySubmissions?.filter(s => 
      s.status === 'hired' && new Date(s.created_at) >= startOfMonth
    ).length || 0;

    // Calculate performance score (simple algorithm)
    const performanceScore = Math.min(
      100,
      (myPlacementsThisMonth * 20) + 
      (mySubmissions?.filter(s => s.status === 'interviewed').length || 0) * 5
    );

    return {
      ...baseStats,
      my_jobs: myJobs?.length || 0,
      my_submissions: mySubmissions?.length || 0,
      my_placements_this_month: myPlacementsThisMonth,
      performance_score: performanceScore,
    };
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    throw error;
  }
}

// ============================================================================
// Get Team Lead Stats
// ============================================================================

export async function getTeamLeadStats(teamLeadId: string): Promise<TeamLeadStats> {
  const supabase = createClient();
  
  try {
    // Get base stats
    const baseStats = await getDashboardStats(teamLeadId, 'team_lead');

    // Get team members (recruiters reporting to this team lead)
    const { data: teamMembers } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('reports_to', teamLeadId)
      .eq('role', 'recruiter');

    const teamSize = teamMembers?.length || 0;

    // Get team placements this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const teamMemberIds = teamMembers?.map(m => m.id) || [];

    const { data: teamSubmissions } = await supabase
      .from('submissions')
      .select('status, submitted_by, created_at')
      .in('submitted_by', teamMemberIds);

    const teamPlacementsThisMonth = teamSubmissions?.filter(s => 
      s.status === 'hired' && new Date(s.created_at) >= startOfMonth
    ).length || 0;

    // Calculate top performers
    const performerMap = new Map<string, number>();
    teamSubmissions?.forEach(s => {
      if (s.status === 'hired') {
        const count = performerMap.get(s.submitted_by) || 0;
        performerMap.set(s.submitted_by, count + 1);
      }
    });

    const topPerformers = Array.from(performerMap.entries())
      .map(([id, placements]) => ({
        recruiter_name: teamMembers?.find(m => m.id === id)?.full_name || 'Unknown',
        placements,
      }))
      .sort((a, b) => b.placements - a.placements)
      .slice(0, 5);

    return {
      ...baseStats,
      team_size: teamSize,
      team_placements_this_month: teamPlacementsThisMonth,
      team_revenue_this_month: teamPlacementsThisMonth * 5000, // Estimate
      top_performers: topPerformers,
    };
  } catch (error) {
    console.error('Error fetching team lead stats:', error);
    throw error;
  }
}

// ============================================================================
// Get Owner/Admin Stats
// ============================================================================

export async function getOwnerStats(): Promise<OwnerStats> {
  const supabase = createClient();
  
  try {
    // Get base stats
    const baseStats = await getDashboardStats();

    // Get year-to-date stats
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const { data: ytdSubmissions } = await supabase
      .from('submissions')
      .select('status, created_at')
      .eq('status', 'hired')
      .gte('created_at', startOfYear.toISOString());

    const totalPlacementsThisYear = ytdSubmissions?.length || 0;
    const totalRevenueThisYear = totalPlacementsThisYear * 5000; // Estimate

    // Get active recruiters
    const { data: activeRecruiters } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)
      .in('role', ['recruiter', 'team_lead']);

    // Get clients added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data: newClients } = await supabase
      .from('clients')
      .select('id')
      .gte('created_at', startOfMonth.toISOString());

    // Calculate average time to fill (placeholder - would need more complex query)
    const avgTimeToFill = 21; // days (placeholder)

    return {
      ...baseStats,
      total_revenue_this_year: totalRevenueThisYear,
      total_placements_this_year: totalPlacementsThisYear,
      active_recruiters: activeRecruiters?.length || 0,
      clients_added_this_month: newClients?.length || 0,
      avg_time_to_fill: avgTimeToFill,
    };
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    throw error;
  }
}

// ============================================================================
// Get Recent Activity
// ============================================================================

export interface ActivityItem {
  id: string;
  type: 'job_created' | 'submission_created' | 'candidate_added' | 'interview_scheduled';
  title: string;
  description: string;
  user_name: string;
  created_at: string;
}

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  const supabase = createClient();
  
  try {
    const { data: activities } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    return activities?.map(a => ({
      id: a.id,
      type: a.action_type,
      title: a.action_description,
      description: a.details || '',
      user_name: a.user?.full_name || 'Unknown',
      created_at: a.created_at,
    })) || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// ============================================================================
// Get Pipeline Stats (for charts)
// ============================================================================

export interface PipelineData {
  stage: string;
  count: number;
}

export async function getPipelineStats(): Promise<PipelineData[]> {
  const supabase = createClient();
  
  try {
    const { data: submissions } = await supabase
      .from('submissions')
      .select('status');

    const stages = [
      'new',
      'pre_screening',
      'submitted_to_client',
      'interview_scheduled',
      'offer_extended',
      'hired',
    ];

    return stages.map(stage => ({
      stage: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: submissions?.filter(s => s.status === stage).length || 0,
    }));
  } catch (error) {
    console.error('Error fetching pipeline stats:', error);
    return [];
  }
}
