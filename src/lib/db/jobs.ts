// ============================================================================
// Jobs Database Operations
// ============================================================================
// Complete CRUD operations for jobs with filtering, pagination, and stats

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

// ============================================================================
// Types
// ============================================================================

export interface JobFilters {
  status?: string | string[];
  client_id?: string;
  location_type?: string | string[];
  search?: string;
  skills?: string[];
  experience_min?: number;
  created_after?: Date;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Get Jobs with Filters
// ============================================================================

export async function getJobs(
  filters: JobFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<JobListResponse> {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('job_status', filters.status);
      } else {
        query = query.eq('job_status', filters.status);
      }
    }

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    if (filters.location_type) {
      if (Array.isArray(filters.location_type)) {
        query = query.in('location_type', filters.location_type);
      } else {
        query = query.eq('location_type', filters.location_type);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.contains('skills_required', filters.skills);
    }

    if (filters.experience_min !== undefined) {
      query = query.gte('experience_min', filters.experience_min);
    }

    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after.toISOString());
    }

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortBy, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

// ============================================================================
// Get Single Job
// ============================================================================

export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
}

// ============================================================================
// Create Job
// ============================================================================

export async function createJob(jobData: Partial<JobInsert>): Promise<Job> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        ...jobData,
        job_type: 'contract', // Always contract for consultancy
        job_status: jobData.job_status || 'draft',
      }])
      .select(`
        *,
        client:clients(*),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// ============================================================================
// Update Job
// ============================================================================

export async function updateJob(
  jobId: string,
  updates: Partial<JobUpdate>
): Promise<Job> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select(`
        *,
        client:clients(*),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

// ============================================================================
// Delete Job (Soft Delete)
// ============================================================================

export async function deleteJob(jobId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        job_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

// ============================================================================
// Change Job Status
// ============================================================================

export async function changeJobStatus(
  jobId: string,
  newStatus: string
): Promise<Job> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        job_status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'closed' && { closed_at: new Date().toISOString() }),
        ...(newStatus === 'open' && { published_at: new Date().toISOString(), is_published: true }),
      })
      .eq('id', jobId)
      .select(`
        *,
        client:clients(*),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error changing job status:', error);
    throw error;
  }
}

// ============================================================================
// Get Job Stats
// ============================================================================

export async function getJobStats() {
  const supabase = createClient();
  
  try {
    // Get all jobs
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('job_status, created_at');

    if (error) throw error;

    const stats = {
      total: jobs.length,
      open: jobs.filter(j => j.job_status === 'open').length,
      closed: jobs.filter(j => j.job_status === 'closed').length,
      draft: jobs.filter(j => j.job_status === 'draft').length,
      on_hold: jobs.filter(j => j.job_status === 'on_hold').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching job stats:', error);
    throw error;
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

export async function bulkUpdateJobStatus(
  jobIds: string[],
  newStatus: string
): Promise<number> {
  const supabase = createClient();
  
  try {
    const { count, error } = await supabase
      .from('jobs')
      .update({ 
        job_status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .in('id', jobIds)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error bulk updating jobs:', error);
    throw error;
  }
}

export async function bulkDeleteJobs(jobIds: string[]): Promise<number> {
  const supabase = createClient();
  
  try {
    const { count, error } = await supabase
      .from('jobs')
      .update({ 
        job_status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .in('id', jobIds)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error bulk deleting jobs:', error);
    throw error;
  }
}
