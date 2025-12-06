import { Candidate, Job } from '@/lib/types';

export interface MatchResult {
  candidate: Candidate;
  score: number;
  reasons: string[];
  skillMatch: Record<string, boolean>;
}

export async function calculateMatch(
  candidate: Candidate,
  job: Job
): Promise<MatchResult> {
  // Simple matching algorithm
  let score = 0;
  const reasons: string[] = [];
  const skillMatch: Record<string, boolean> = {};

  // Skill matching (40% weight)
  const candidateSkills = candidate.skills || [];
  const jobSkills = job.skills_required || [];
  
  let matchedSkills = 0;
  jobSkills.forEach((skill: string) => {
    const matched = candidateSkills.some((cs: string) => 
      cs.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(cs.toLowerCase())
    );
    skillMatch[skill] = matched;
    if (matched) matchedSkills++;
  });

  if (jobSkills.length > 0) {
    const skillScore = (matchedSkills / jobSkills.length) * 40;
    score += skillScore;
    if (skillScore > 30) reasons.push(`Strong skill match (${matchedSkills}/${jobSkills.length} skills)`);
  }

  // Experience matching (30% weight)
  const yearsExp = candidate.years_of_experience || 0;
  if (yearsExp >= 3) {
    score += 30;
    reasons.push(`${yearsExp} years of experience`);
  } else if (yearsExp >= 1) {
    score += 15;
  }

  // Location matching (15% weight)
  if (candidate.location && job.location) {
    if (candidate.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(candidate.location.toLowerCase())) {
      score += 15;
      reasons.push('Location match');
    }
  }

  // EU nationality if required (15% weight)
  if ((job as any).eu_nationality_required) {
    if (candidate.has_eu_nationality) {
      score += 15;
      reasons.push('EU nationality confirmed');
    }
  } else {
    score += 15; // No requirement, full points
  }

  return {
    candidate,
    score: Math.min(Math.round(score), 100),
    reasons,
    skillMatch,
  };
}

export async function matchCandidates(
  candidates: Candidate[],
  job: Job
): Promise<MatchResult[]> {
  const matches = await Promise.all(
    candidates.map(candidate => calculateMatch(candidate, job))
  );

  return matches.sort((a, b) => b.score - a.score);
}
