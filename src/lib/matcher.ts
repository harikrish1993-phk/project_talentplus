import OpenAI from 'openai';
import { Job, Candidate, Match } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface MatchScore {
  overall: number;
  skills_match: number;
  experience_match: number;
  location_match: number;
  education_match: number;
}

export interface MatchResult {
  match_score: number;
  score_breakdown: MatchScore;
  matching_skills: string[];
  missing_skills: string[];
  ai_summary: string;
}

/**
 * Calculate match score between a job and candidate
 */
export async function calculateMatch(
  job: Job,
  candidate: Candidate
): Promise<MatchResult> {
  try {
    // Calculate individual component scores
    const skillsMatch = calculateSkillsMatch(
      job.skills_required,
      candidate.skills
    );
    const experienceMatch = calculateExperienceMatch(
      job.experience_level,
      candidate.years_of_experience || 0
    );
    const locationMatch = calculateLocationMatch(
      job.location,
      candidate.location || ''
    );
    const educationMatch = calculateEducationMatch(
      job.requirements,
      candidate.education
    );

    // Weighted overall score
    const overall = Math.round(
      skillsMatch.score * 0.4 +
        experienceMatch * 0.3 +
        locationMatch * 0.2 +
        educationMatch * 0.1
    );

    // Generate AI summary
    const aiSummary = await generateMatchSummary(
      job,
      candidate,
      overall,
      skillsMatch
    );

    return {
      match_score: overall,
      score_breakdown: {
        overall,
        skills_match: skillsMatch.score,
        experience_match: experienceMatch,
        location_match: locationMatch,
        education_match: educationMatch,
      },
      matching_skills: skillsMatch.matching,
      missing_skills: skillsMatch.missing,
      ai_summary: aiSummary,
    };
  } catch (error) {
    console.error('Match calculation error:', error);
    throw error;
  }
}

/**
 * Calculate skills match score
 */
function calculateSkillsMatch(
  requiredSkills: string[],
  candidateSkills: string[]
): {
  score: number;
  matching: string[];
  missing: string[];
} {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 100, matching: [], missing: [] };
  }

  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());
  const normalizedCandidate = candidateSkills.map((s) =>
    s.toLowerCase().trim()
  );

  const matching: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const normalized = skill.toLowerCase().trim();
    if (normalizedCandidate.some((cs) => cs.includes(normalized) || normalized.includes(cs))) {
      matching.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matching.length / requiredSkills.length) * 100);

  return { score, matching, missing };
}

/**
 * Calculate experience match score
 */
function calculateExperienceMatch(
  requiredLevel: string,
  candidateYears: number
): number {
  const levelRanges: Record<string, { min: number; max: number }> = {
    entry: { min: 0, max: 2 },
    mid: { min: 2, max: 5 },
    senior: { min: 5, max: 10 },
    lead: { min: 8, max: 15 },
    executive: { min: 10, max: 50 },
  };

  const range = levelRanges[requiredLevel] || { min: 0, max: 50 };

  if (candidateYears >= range.min && candidateYears <= range.max) {
    return 100;
  } else if (candidateYears < range.min) {
    // Under-qualified
    const diff = range.min - candidateYears;
    return Math.max(0, 100 - diff * 20);
  } else {
    // Over-qualified
    const diff = candidateYears - range.max;
    return Math.max(60, 100 - diff * 5);
  }
}

/**
 * Calculate location match score
 */
function calculateLocationMatch(
  jobLocation: string,
  candidateLocation: string
): number {
  if (!jobLocation || !candidateLocation) return 50;

  const jobLoc = jobLocation.toLowerCase().trim();
  const candLoc = candidateLocation.toLowerCase().trim();

  // Exact match
  if (jobLoc === candLoc) return 100;

  // Same city
  const jobCity = jobLoc.split(',')[0].trim();
  const candCity = candLoc.split(',')[0].trim();
  if (jobCity === candCity) return 90;

  // Same state/country
  const jobParts = jobLoc.split(',').map((p) => p.trim());
  const candParts = candLoc.split(',').map((p) => p.trim());
  if (jobParts.some((p) => candParts.includes(p))) return 70;

  // Remote or flexible
  if (jobLoc.includes('remote') || candLoc.includes('remote')) return 80;

  return 30;
}

/**
 * Calculate education match score
 */
function calculateEducationMatch(
  requirements: string[],
  education: any[]
): number {
  if (!requirements || requirements.length === 0) return 100;
  if (!education || education.length === 0) return 50;

  // Check if any requirement mentions degree
  const requiresDegree = requirements.some((req) =>
    req.toLowerCase().includes('degree') ||
    req.toLowerCase().includes('bachelor') ||
    req.toLowerCase().includes('master') ||
    req.toLowerCase().includes('phd')
  );

  if (!requiresDegree) return 100;

  // Check candidate's highest degree
  const degrees = education.map((e) => e.degree?.toLowerCase() || '');
  const hasBachelor = degrees.some((d) => d.includes('bachelor'));
  const hasMaster = degrees.some((d) => d.includes('master'));
  const hasPhd = degrees.some((d) => d.includes('phd') || d.includes('doctorate'));

  if (hasPhd) return 100;
  if (hasMaster) return 95;
  if (hasBachelor) return 85;

  return 60;
}

/**
 * Generate AI-powered match summary
 */
async function generateMatchSummary(
  job: Job,
  candidate: Candidate,
  overallScore: number,
  skillsMatch: { matching: string[]; missing: string[] }
): Promise<string> {
  try {
    const prompt = `Generate a concise 2-3 sentence summary of this candidate-job match.

Job: ${job.title}
Required Skills: ${job.skills_required.join(', ')}
Experience Level: ${job.experience_level}

Candidate: ${candidate.name}
Title: ${candidate.title || 'N/A'}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.years_of_experience} years

Match Score: ${overallScore}%
Matching Skills: ${skillsMatch.matching.join(', ')}
Missing Skills: ${skillsMatch.missing.join(', ')}

Provide a professional summary highlighting strengths and gaps.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a recruitment expert providing match analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || 'Match analysis unavailable';
  } catch (error) {
    console.error('AI summary generation error:', error);
    return `${overallScore >= 80 ? 'Strong' : overallScore >= 60 ? 'Good' : 'Fair'} match with ${skillsMatch.matching.length} matching skills.`;
  }
}

/**
 * Find best matches for a job
 */
export async function findMatchesForJob(
  job: Job,
  candidates: Candidate[],
  minScore: number = 60
): Promise<MatchResult[]> {
  const matches: MatchResult[] = [];

  for (const candidate of candidates) {
    const match = await calculateMatch(job, candidate);
    if (match.match_score >= minScore) {
      matches.push(match);
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.match_score - a.match_score);
}

/**
 * Find best jobs for a candidate
 */
export async function findJobsForCandidate(
  candidate: Candidate,
  jobs: Job[],
  minScore: number = 60
): Promise<MatchResult[]> {
  const matches: MatchResult[] = [];

  for (const job of jobs) {
    const match = await calculateMatch(job, candidate);
    if (match.match_score >= minScore) {
      matches.push(match);
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.match_score - a.match_score);
}
