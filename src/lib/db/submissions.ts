// ============================================================================
// Submissions Database Operations (with Kanban support)
// Path: lib/db/submissions.ts
// ============================================================================

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type SubmissionStatus =
  | 'new'
  | 'pre_screening'
  | 'internal_review'
  | 'submitted_to_client'
  | 'client_review'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'hired'
  | 'rejected';

export interface Submission {
  id: string;
  organization_id: string;
  job_id: string;
  candidate_id: string;
  
  // Status & Workflow
  status: SubmissionStatus;
  status_history: Array<{
    status: SubmissionStatus;
    changed_at: string;
    changed_by: string;
    notes?: string;
  }>;
  
  // Details
  submitted_by: string;
  submitted_at: string;
  resume_version_url?: string;
  cover_letter?: string;
  notes?: string;
  
  // Rates & Contract
  proposed_bill_rate?: number;
  proposed_pay_rate?: number;
  currency?: string;
  contract_duration_months?: number;
  start_date?: string;
  
  // Client Feedback
  client_feedback?: string;
  rejection_reason?: string;
  interview_feedback?: Array<{
    interviewer: string;
    date: string;
    feedback: string;
    rating?: number;
  }>;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Relations (populated in queries)
  job?: any;
  candidate?: any;
  submitter?: any;
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  job_id?: string;
  candidate_id?: string;
  submitted_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ============================================================================
// Get Submissions with Filters
// ============================================================================

export async function getSubmissions(
  filters: SubmissionFilters = {},
  page: number = 1,
  limit: number = 50
): Promise<{
  data: Submission[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('submissions')
      .select(`
        *,
        job:jobs(id, title, client_id, clients(name)),
        candidate:candidates(id, first_name, last_name, email, current_title)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id);
    }

    if (filters.candidate_id) {
      query = query.eq('candidate_id', filters.candidate_id);
    }

    if (filters.submitted_by) {
      query = query.eq('submitted_by', filters.submitted_by);
    }

    if (filters.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    // Sorting
    query = query.order('created_at', { ascending: false });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      page,
      limit,
      total: count || 0,
      hasMore: count ? offset + limit < count : false,
    };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

// ============================================================================
// Get Submissions for Kanban Board
// ============================================================================

export async function getSubmissionsForKanban(): Promise<{
  [key: string]: Submission[];
}> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        job:jobs(id, title, client_id, clients(name)),
        candidate:candidates(id, first_name, last_name, email, current_title, skills)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by status for Kanban columns
    const grouped: { [key: string]: Submission[] } = {
      new: [],
      pre_screening: [],
      internal_review: [],
      submitted_to_client: [],
      client_review: [],
      interview_scheduled: [],
      interviewed: [],
      offer_extended: [],
      offer_accepted: [],
      hired: [],
      rejected: [],
    };

    data?.forEach(submission => {
      if (grouped[submission.status]) {
        grouped[submission.status].push(submission);
      }
    });

    return grouped;
  } catch (error) {
    console.error('Error fetching submissions for Kanban:', error);
    throw error;
  }
}

// ============================================================================
// Get Single Submission
// ============================================================================

export async function getSubmission(id: string): Promise<Submission | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        job:jobs(*),
        candidate:candidates(*),
        submitter:users(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
}

// ============================================================================
// Create Submission
// ============================================================================

export async function createSubmission(
  submission: Omit<Submission, 'id' | 'created_at' | 'updated_at' | 'status_history'>
): Promise<Submission> {
  const supabase = createClient();

  try {
    const newSubmission = {
      ...submission,
      status: submission.status || 'new',
      status_history: [{
        status: submission.status || 'new',
        changed_at: new Date().toISOString(),
        changed_by: submission.submitted_by,
        notes: 'Submission created'
      }]
    };

    const { data, error } = await supabase
      .from('submissions')
      .insert([newSubmission])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

// ============================================================================
// Update Submission
// ============================================================================

export async function updateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<Submission> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

// ============================================================================
// Change Submission Status (for Kanban drag & drop)
// ============================================================================

export async function changeSubmissionStatus(
  id: string,
  newStatus: SubmissionStatus,
  changedBy: string,
  notes?: string
): Promise<Submission> {
  const supabase = createClient();

  try {
    // Get current submission to append to history
    const current = await getSubmission(id);
    if (!current) throw new Error('Submission not found');

    const statusHistory = [
      ...(current.status_history || []),
      {
        status: newStatus,
        changed_at: new Date().toISOString(),
        changed_by: changedBy,
        notes: notes || `Status changed to ${newStatus}`
      }
    ];

    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        status_history: statusHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error changing submission status:', error);
    throw error;
  }
}

// ============================================================================
// Bulk Update Submissions Status
// ============================================================================

export async function bulkUpdateSubmissionStatus(
  ids: string[],
  newStatus: SubmissionStatus,
  changedBy: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      await changeSubmissionStatus(id, newStatus, changedBy);
      success++;
    } catch (error) {
      console.error(`Failed to update submission ${id}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

// ============================================================================
// Delete Submission
// ============================================================================

export async function deleteSubmission(id: string): Promise<void> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw error;
  }
}

// ============================================================================
// Get Submission Statistics
// ============================================================================

export async function getSubmissionStats() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('status, created_at');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      by_status: {} as { [key: string]: number },
      hired_this_month: 0,
      conversion_rate: 0,
    };

    // Count by status
    data?.forEach(submission => {
      stats.by_status[submission.status] = 
        (stats.by_status[submission.status] || 0) + 1;
    });

    // Hired this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    stats.hired_this_month = data?.filter(s => 
      s.status === 'hired' && 
      new Date(s.created_at) >= startOfMonth
    ).length || 0;

    // Conversion rate
    if (stats.total > 0) {
      stats.conversion_rate = 
        Math.round(((stats.by_status.hired || 0) / stats.total) * 100 * 10) / 10;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    throw error;
  }
}

// ============================================================================
// Get Submissions by Recruiter
// ============================================================================

export async function getSubmissionsByRecruiter(
  recruiterId: string
): Promise<Submission[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        job:jobs(id, title),
        candidate:candidates(id, first_name, last_name)
      `)
      .eq('submitted_by', recruiterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching submissions by recruiter:', error);
    return [];
  }
}
