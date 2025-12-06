import { Job } from '@/lib/types';

export interface JobAnalysis {
  complexity: 'junior' | 'mid' | 'senior' | 'expert';
  requiredSkills: string[];
  niceToHaveSkills: string[];
  estimatedSalaryRange: { min: number; max: number; currency: string };
  timeToFill: number; // days
  candidatePoolSize: 'small' | 'medium' | 'large';
}

export async function analyzeJob(job: Job): Promise<JobAnalysis> {
  // Simple analysis based on job requirements
  const skillCount = (job.skills_required || []).length;
  const experienceLevel = (job as any).experience_required || '';

  let complexity: JobAnalysis['complexity'] = 'mid';
  if (experienceLevel.includes('senior') || experienceLevel.includes('lead')) {
    complexity = 'senior';
  } else if (experienceLevel.includes('junior') || experienceLevel.includes('entry')) {
    complexity = 'junior';
  } else if (experienceLevel.includes('expert') || experienceLevel.includes('principal')) {
    complexity = 'expert';
  }

  const baseMin = complexity === 'junior' ? 40000 : 
                  complexity === 'mid' ? 60000 :
                  complexity === 'senior' ? 80000 : 100000;

  return {
    complexity,
    requiredSkills: job.skills_required || [],
    niceToHaveSkills: (job as any).skills_preferred || [],
    estimatedSalaryRange: {
      min: baseMin,
      max: baseMin * 1.5,
      currency: 'EUR'
    },
    timeToFill: complexity === 'junior' ? 30 : complexity === 'mid' ? 45 : 60,
    candidatePoolSize: skillCount < 3 ? 'large' : skillCount < 6 ? 'medium' : 'small'
  };
}
