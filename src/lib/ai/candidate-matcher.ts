// ============================================================================
// Candidate Matcher - AI-Powered Candidate-Job Matching
// Path: lib/ai/candidate-matcher.ts
// ============================================================================

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Types
// ============================================================================

export interface MatchResult {
  candidate_id: string;
  job_id: string;
  match_score: number; // 0-100
  match_reasons: string[];
  missing_skills: string[];
  matching_skills: string[];
  experience_match: boolean;
  location_match: boolean;
  confidence: number;
  recommendation: 'strong_match' | 'good_match' | 'potential_match' | 'weak_match';
}

export interface CandidateProfile {
  id: string;
  name: string;
  skills: string[];
  experience_years: number;
  location?: string;
  certifications?: string[];
  languages?: string[];
  education?: string;
  current_title?: string;
  summary?: string;
}

export interface JobRequirements {
  id: string;
  title: string;
  skills_required: string[];
  skills_preferred?: string[];
  experience_min?: number;
  experience_max?: number;
  location?: string;
  location_type?: string;
  certifications_required?: string[];
  languages_required?: string[];
  requires_eu_nationality?: boolean;
  education_required?: string;
  description?: string;
}

// ============================================================================
// AI Providers
// ============================================================================

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ============================================================================
// Main Match Function
// ============================================================================

export async function matchCandidateToJob(
  candidate: CandidateProfile,
  job: JobRequirements,
  useAI: boolean = true
): Promise<MatchResult> {
  
  if (useAI && (openai || anthropic)) {
    try {
      return await matchWithAI(candidate, job);
    } catch (error) {
      console.error('AI matching failed, falling back to algorithm:', error);
      return matchWithAlgorithm(candidate, job);
    }
  }
  
  return matchWithAlgorithm(candidate, job);
}

// ============================================================================
// Match Multiple Candidates to Job
// ============================================================================

export async function matchCandidatesToJob(
  candidates: CandidateProfile[],
  job: JobRequirements,
  topN: number = 10
): Promise<MatchResult[]> {
  
  const matches = await Promise.all(
    candidates.map(candidate => matchCandidateToJob(candidate, job, false))
  );
  
  // Sort by match score and return top N
  return matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, topN);
}

// ============================================================================
// Match Candidate to Multiple Jobs
// ============================================================================

export async function matchCandidateToJobs(
  candidate: CandidateProfile,
  jobs: JobRequirements[],
  topN: number = 10
): Promise<MatchResult[]> {
  
  const matches = await Promise.all(
    jobs.map(job => matchCandidateToJob(candidate, job, false))
  );
  
  // Sort by match score and return top N
  return matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, topN);
}

// ============================================================================
// AI-Powered Matching
// ============================================================================

async function matchWithAI(
  candidate: CandidateProfile,
  job: JobRequirements
): Promise<MatchResult> {
  
  const prompt = buildMatchingPrompt(candidate, job);
  
  if (openai) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruitment AI that matches candidates to jobs. Analyze the match and return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    const aiResult = JSON.parse(content);
    return normalizeMatchResult(candidate.id, job.id, aiResult);
    
  } else if (anthropic) {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nReturn ONLY valid JSON, no markdown.`
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Invalid response');

    let jsonText = content.text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const aiResult = JSON.parse(jsonText);
    return normalizeMatchResult(candidate.id, job.id, aiResult);
  }
  
  throw new Error('No AI provider available');
}

// ============================================================================
// Algorithm-Based Matching
// ============================================================================

function matchWithAlgorithm(
  candidate: CandidateProfile,
  job: JobRequirements
): MatchResult {
  
  let totalScore = 0;
  const maxScore = 100;
  const matchReasons: string[] = [];
  const missingSkills: string[] = [];
  const matchingSkills: string[] = [];
  
  // 1. Skills Match (40 points max)
  const requiredSkills = job.skills_required || [];
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  
  let skillScore = 0;
  requiredSkills.forEach(skill => {
    if (candidateSkills.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
      skillScore += 40 / requiredSkills.length;
    } else {
      missingSkills.push(skill);
    }
  });
  totalScore += skillScore;
  
  if (matchingSkills.length > 0) {
    matchReasons.push(`Matches ${matchingSkills.length}/${requiredSkills.length} required skills`);
  }
  
  // 2. Experience Match (25 points max)
  let experienceMatch = false;
  if (job.experience_min !== undefined) {
    if (candidate.experience_years >= job.experience_min) {
      const expScore = 25;
      totalScore += expScore;
      experienceMatch = true;
      matchReasons.push(`Has ${candidate.experience_years} years experience (required: ${job.experience_min}+)`);
    }
  } else {
    totalScore += 25; // No requirement = full points
    experienceMatch = true;
  }
  
  // 3. Certifications (15 points max)
  if (job.certifications_required && job.certifications_required.length > 0) {
    const candidateCerts = (candidate.certifications || []).map(c => c.toLowerCase());
    const matchedCerts = job.certifications_required.filter(cert => 
      candidateCerts.includes(cert.toLowerCase())
    );
    
    if (matchedCerts.length > 0) {
      const certScore = 15 * (matchedCerts.length / job.certifications_required.length);
      totalScore += certScore;
      matchReasons.push(`Has ${matchedCerts.length}/${job.certifications_required.length} required certifications`);
    }
  } else {
    totalScore += 15; // No requirement = full points
  }
  
  // 4. Location Match (10 points max)
  let locationMatch = false;
  if (job.location_type === 'remote') {
    totalScore += 10;
    locationMatch = true;
    matchReasons.push('Job is remote');
  } else if (job.location && candidate.location) {
    if (candidate.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(candidate.location.toLowerCase())) {
      totalScore += 10;
      locationMatch = true;
      matchReasons.push('Location matches');
    }
  } else {
    totalScore += 5; // Partial points if no location specified
    locationMatch = true;
  }
  
  // 5. Languages (10 points max)
  if (job.languages_required && job.languages_required.length > 0) {
    const candidateLangs = (candidate.languages || []).map(l => l.toLowerCase());
    const matchedLangs = job.languages_required.filter(lang => 
      candidateLangs.includes(lang.toLowerCase())
    );
    
    if (matchedLangs.length > 0) {
      const langScore = 10 * (matchedLangs.length / job.languages_required.length);
      totalScore += langScore;
      matchReasons.push(`Speaks ${matchedLangs.length}/${job.languages_required.length} required languages`);
    }
  } else {
    totalScore += 10; // No requirement = full points
  }
  
  // Calculate recommendation
  let recommendation: MatchResult['recommendation'];
  if (totalScore >= 80) {
    recommendation = 'strong_match';
  } else if (totalScore >= 60) {
    recommendation = 'good_match';
  } else if (totalScore >= 40) {
    recommendation = 'potential_match';
  } else {
    recommendation = 'weak_match';
  }
  
  // Confidence based on completeness of data
  const confidence = calculateConfidence(candidate, job);
  
  return {
    candidate_id: candidate.id,
    job_id: job.id,
    match_score: Math.round(totalScore),
    match_reasons: matchReasons,
    missing_skills: missingSkills,
    matching_skills: matchingSkills,
    experience_match: experienceMatch,
    location_match: locationMatch,
    confidence,
    recommendation
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildMatchingPrompt(
  candidate: CandidateProfile,
  job: JobRequirements
): string {
  return `
Analyze how well this candidate matches this job and provide a detailed assessment:

CANDIDATE:
Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.experience_years} years
Location: ${candidate.location || 'Not specified'}
Certifications: ${candidate.certifications?.join(', ') || 'None'}
Languages: ${candidate.languages?.join(', ') || 'Not specified'}
Current Title: ${candidate.current_title || 'Not specified'}
Summary: ${candidate.summary || 'Not provided'}

JOB:
Title: ${job.title}
Required Skills: ${job.skills_required.join(', ')}
Preferred Skills: ${job.skills_preferred?.join(', ') || 'None'}
Experience: ${job.experience_min || 0}-${job.experience_max || 'any'} years
Location: ${job.location || 'Any'} (${job.location_type || 'not specified'})
Required Certifications: ${job.certifications_required?.join(', ') || 'None'}
Required Languages: ${job.languages_required?.join(', ') || 'None'}
Education: ${job.education_required || 'Not specified'}

Provide a JSON response with this structure:

{
  "match_score": 85,
  "match_reasons": ["Reason 1", "Reason 2"],
  "missing_skills": ["Skill 1", "Skill 2"],
  "matching_skills": ["Skill 1", "Skill 2"],
  "experience_match": true,
  "location_match": true,
  "recommendation": "strong_match",
  "detailed_analysis": "Brief explanation"
}

SCORING GUIDE:
- 90-100: Perfect match
- 80-89: Strong match
- 60-79: Good match
- 40-59: Potential match
- 0-39: Weak match

Consider:
1. Required vs preferred skills
2. Years of experience alignment
3. Location compatibility
4. Certifications and languages
5. Career progression fit
`;
}

function normalizeMatchResult(
  candidateId: string,
  jobId: string,
  aiResult: any
): MatchResult {
  return {
    candidate_id: candidateId,
    job_id: jobId,
    match_score: Math.min(100, Math.max(0, aiResult.match_score || 0)),
    match_reasons: Array.isArray(aiResult.match_reasons) ? aiResult.match_reasons : [],
    missing_skills: Array.isArray(aiResult.missing_skills) ? aiResult.missing_skills : [],
    matching_skills: Array.isArray(aiResult.matching_skills) ? aiResult.matching_skills : [],
    experience_match: aiResult.experience_match === true,
    location_match: aiResult.location_match === true,
    confidence: 0.9, // AI results have high confidence
    recommendation: aiResult.recommendation || 'potential_match'
  };
}

function calculateConfidence(
  candidate: CandidateProfile,
  job: JobRequirements
): number {
  let completeness = 0;
  let total = 0;
  
  // Candidate completeness
  if (candidate.skills.length > 0) completeness += 1;
  total += 1;
  
  if (candidate.experience_years > 0) completeness += 1;
  total += 1;
  
  if (candidate.location) completeness += 1;
  total += 1;
  
  // Job completeness
  if (job.skills_required.length > 0) completeness += 1;
  total += 1;
  
  if (job.experience_min !== undefined) completeness += 1;
  total += 1;
  
  return Math.round((completeness / total) * 100) / 100;
}

// ============================================================================
// Batch Matching for Dashboard
// ============================================================================

export async function getBestMatches(
  jobId: string,
  candidates: CandidateProfile[],
  job: JobRequirements,
  limit: number = 10
): Promise<MatchResult[]> {
  
  const matches = await Promise.all(
    candidates.map(candidate => matchCandidateToJob(candidate, job, false))
  );
  
  return matches
    .filter(m => m.match_score >= 40) // Minimum 40% match
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);
}
