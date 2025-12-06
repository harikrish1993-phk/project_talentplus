// ============================================================================
// Core Component: Candidate Management (src/lib/db/candidates.ts)
// Stabilized with Multi-Tenancy, Activity Logging, and Consolidated Schema
// ============================================================================

import { createServerClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/audit/activity-logger';
import { Candidate } from '@/lib/types';
// NOTE: candidateSchema validation is assumed to be implemented in '@/lib/validation/candidate-schema'

// --- Types (Simplified for this file) ---
interface CandidateCreateData {
  organization_id: string;
  full_name: string;
  email: string;
  resume_text: string;
  source: string;
  // ... other fields
}

interface CandidateUpdateData {
  full_name?: string;
  email?: string;
  skills?: string[];
  // ... other fields
}

// --- Core Functions ---

/**
 * Creates a new candidate in the database.
 * @param data - Candidate creation data.
 * @param userId - ID of the user creating the candidate.
 * @returns The created Candidate object.
 */
export async function createCandidate(data: CandidateCreateData, userId: string): Promise<Candidate> {
  const supabase = createServerClient();

  // 1. Validate data (Assuming validation is done before this call)
  // const validatedData = candidateSchema.parse(data);

  // 2. Insert into database
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating candidate:', error);
    throw new Error(`Failed to create candidate: ${error.message}`);
  }

  // 3. Log activity
  await logActivity({
    organization_id: data.organization_id,
    user_id: userId,
    action: 'create',
    entity_type: 'candidate',
    entity_id: candidate.id,
    metadata: { name: candidate.full_name, source: candidate.source },
  });

  return candidate as Candidate;
}

/**
 * Retrieves a candidate by their ID.
 * @param candidateId - The ID of the candidate.
 * @param organizationId - The ID of the organization.
 * @returns The Candidate object or null if not found.
 */
export async function getCandidateById(candidateId: string, organizationId: string): Promise<Candidate | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Supabase error fetching candidate:', error);
    throw new Error(`Failed to fetch candidate: ${error.message}`);
  }

  return data as Candidate | null;
}

/**
 * Updates an existing candidate.
 * @param candidateId - The ID of the candidate to update.
 * @param data - The data to update.
 * @param userId - The ID of the user performing the update.
 * @returns The updated Candidate object.
 */
export async function updateCandidate(candidateId: string, data: CandidateUpdateData, userId: string, organizationId: string): Promise<Candidate> {
  const supabase = createServerClient();

  // 1. Update database
  const { data: candidate, error } = await supabase
    .from('candidates')
    .update(data)
    .eq('id', candidateId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    console.error('Supabase error updating candidate:', error);
    throw new Error(`Failed to update candidate: ${error.message}`);
  }

  // 2. Log activity
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'update',
    entity_type: 'candidate',
    entity_id: candidate.id,
    metadata: { name: candidate.full_name, changes: Object.keys(data) },
  });

  return candidate as Candidate;
}

/**
 * Retrieves a list of candidates for an organization with filtering and pagination.
 * @param organizationId - The ID of the organization.
 * @param filters - Optional filters (skills, search, source).
 * @param page - Page number (1-indexed).
 * @param limit - Items per page.
 * @returns A list of Candidate objects and the total count.
 */
export async function getCandidates(
  organizationId: string,
  filters: { skills?: string[]; search?: string; source?: string },
  page: number = 1,
  limit: number = 20
): Promise<{ candidates: Candidate[]; totalCount: number }> {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('candidates')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  // Apply filters
  if (filters.skills && filters.skills.length > 0) {
    // Assuming a GIN index on the skills column for efficient search
    query = query.contains('skills', filters.skills);
  }
  if (filters.source) {
    query = query.eq('source', filters.source);
  }
  if (filters.search) {
    // Basic text search on full_name and email
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Supabase error fetching candidates:', error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return {
    candidates: data as Candidate[],
    totalCount: count || 0,
  };
}
