// ============================================================================
// Candidates API - Match to Jobs
// Path: app/api/candidates/match/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { matchCandidateToJob, matchCandidateToJobs } from '@/lib/ai/candidate-matcher';
import { getCandidate } from '@/lib/db/candidates';
import { getJob, getJobs } from '@/lib/db/jobs';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const matchToJobSchema = z.object({
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid(),
  use_ai: z.boolean().optional().default(true),
});

const matchToMultipleSchema = z.object({
  candidate_id: z.string().uuid(),
  job_ids: z.array(z.string().uuid()).optional(),
  filters: z.object({
    status: z.string().optional(),
    location: z.string().optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
  top_n: z.number().int().min(1).max(50).optional().default(10),
});

// ============================================================================
// POST /api/candidates/match - Match candidate to job(s)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if matching to single job or multiple
    if (body.job_id) {
      return await matchToSingleJob(body);
    } else {
      return await matchToMultipleJobs(body);
    }
  } catch (error: any) {
    console.error('Error matching candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to match candidate',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Match to Single Job
// ============================================================================

async function matchToSingleJob(body: any) {
  const validation = matchToJobSchema.safeParse(body);
  
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
  
  const { candidate_id, job_id, use_ai } = validation.data;
  
  // Fetch candidate and job
  const candidate = await getCandidate(candidate_id);
  const job = await getJob(job_id);
  
  if (!candidate) {
    return NextResponse.json(
      { success: false, error: 'Candidate not found' },
      { status: 404 }
    );
  }
  
  if (!job) {
    return NextResponse.json(
      { success: false, error: 'Job not found' },
      { status: 404 }
    );
  }
  
  // Convert to matcher format
  const candidateProfile = {
    id: candidate.id,
    name: `${candidate.first_name} ${candidate.last_name}`,
    skills: candidate.skills || [],
    experience_years: candidate.total_experience_years || 0,
    location: candidate.location,
    certifications: candidate.certifications,
    languages: candidate.languages,
    education: candidate.education,
    current_title: candidate.current_title,
    summary: candidate.summary,
  };
  
  const jobRequirements = {
    id: job.id,
    title: job.title,
    skills_required: job.skills_required || [],
    skills_preferred: job.skills_preferred,
    experience_min: job.experience_min,
    experience_max: job.experience_max,
    location: job.location,
    location_type: job.location_type,
    certifications_required: job.certifications_required,
    languages_required: job.languages_required,
    requires_eu_nationality: job.requires_eu_nationality,
    education_required: job.education_required,
    description: job.description,
  };
  
  // Match candidate to job
  const match = await matchCandidateToJob(candidateProfile, jobRequirements, use_ai);
  
  return NextResponse.json({
    success: true,
    data: match,
    message: 'Candidate matched successfully',
  });
}

// ============================================================================
// Match to Multiple Jobs
// ============================================================================

async function matchToMultipleJobs(body: any) {
  const validation = matchToMultipleSchema.safeParse(body);
  
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
  
  const { candidate_id, job_ids, filters, top_n } = validation.data;
  
  // Fetch candidate
  const candidate = await getCandidate(candidate_id);
  
  if (!candidate) {
    return NextResponse.json(
      { success: false, error: 'Candidate not found' },
      { status: 404 }
    );
  }
  
  // Fetch jobs (either by IDs or by filters)
  let jobs;
  if (job_ids && job_ids.length > 0) {
    jobs = await Promise.all(job_ids.map(id => getJob(id)));
    jobs = jobs.filter(j => j !== null);
  } else {
    const result = await getJobs(filters || {}, 1, 100);
    jobs = result.data;
  }
  
  // Convert candidate to profile
  const candidateProfile = {
    id: candidate.id,
    name: `${candidate.first_name} ${candidate.last_name}`,
    skills: candidate.skills || [],
    experience_years: candidate.total_experience_years || 0,
    location: candidate.location,
    certifications: candidate.certifications,
    languages: candidate.languages,
    current_title: candidate.current_title,
    summary: candidate.summary,
  };
  
  // Convert jobs to requirements
  const jobRequirements = jobs.map(job => ({
    id: job.id,
    title: job.title,
    skills_required: job.skills_required || [],
    skills_preferred: job.skills_preferred,
    experience_min: job.experience_min,
    experience_max: job.experience_max,
    location: job.location,
    location_type: job.location_type,
    certifications_required: job.certifications_required,
    languages_required: job.languages_required,
    description: job.description,
  }));
  
  // Match candidate to all jobs
  const matches = await matchCandidateToJobs(candidateProfile, jobRequirements, top_n);
  
  return NextResponse.json({
    success: true,
    data: matches,
    total: matches.length,
    message: `Found ${matches.length} matching jobs`,
  });
}

// ============================================================================
// OPTIONS - CORS
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}