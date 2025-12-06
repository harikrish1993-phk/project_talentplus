// ============================================================================
// Interviews Database Operations
// Path: lib/db/interviews.ts
// ============================================================================

import { createClient } from '@/lib/supabase/client';

export interface Interview {
  id: string;
  submission_id: string;
  organization_id: string;
  interview_type: string;
  status: string;
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  location_type: string;
  meeting_link?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  feedback?: string;
  rating?: number;
  recommendation?: string;
  created_at: string;
  updated_at: string;
}

export async function getInterviews(filters: any = {}) {
  const supabase = createClient();
  
  let query = supabase.from('interviews').select(`
    *,
    submission:submissions(
      id,
      job:jobs(id, title),
      candidate:candidates(id, first_name, last_name)
    )
  `);
  
  if (filters.submission_id) query = query.eq('submission_id', filters.submission_id);
  if (filters.status) query = query.eq('status', filters.status);
  
  const { data, error } = await query.order('scheduled_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getInterview(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createInterview(interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .insert([interview])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInterview(id: string, updates: Partial<Interview>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInterview(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('interviews').delete().eq('id', id);
  if (error) throw error;
}
