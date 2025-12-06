// ============================================================================
// AI Job Analyzer - Extract job details from description
// ============================================================================
// This is the CORE AI feature that makes job creation 60 seconds instead of 15 minutes

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Types
// ============================================================================

export interface JobAnalysisResult {
  success: boolean;
  confidence: number; // 0-1 scale
  data: {
    title?: string;
    skills_required: string[];
    certifications_required: string[];
    languages_required: string[];
    experience_min?: number;
    experience_max?: number;
    location?: string;
    location_type?: 'onsite' | 'remote' | 'hybrid';
    requires_eu_nationality: boolean;
    requires_work_permit: boolean;
    requires_security_clearance: boolean;
    duration_months?: number;
    suggested_bill_rate?: number;
    suggested_pay_rate?: number;
    salary_currency?: string;
    education_required?: string;
    key_responsibilities: string[];
    nice_to_have_skills: string[];
  };
  raw_response?: string;
  error?: string;
  extraction_method: 'openai' | 'anthropic' | 'pattern' | 'manual';
}

// ============================================================================
// AI Providers Setup
// ============================================================================

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ============================================================================
// Main Analysis Function
// ============================================================================

export async function analyzeJobDescription(
  description: string,
  preferredProvider: 'openai' | 'anthropic' = 'openai'
): Promise<JobAnalysisResult> {
  
  if (!description || description.trim().length < 100) {
    return {
      success: false,
      confidence: 0,
      data: getEmptyData(),
      error: 'Description too short (minimum 100 characters)',
      extraction_method: 'manual'
    };
  }

  // Try AI providers in order
  try {
    if (preferredProvider === 'openai' && openai) {
      return await analyzeWithOpenAI(description);
    } else if (preferredProvider === 'anthropic' && anthropic) {
      return await analyzeWithAnthropic(description);
    } else {
      // Fallback to the other provider
      if (openai) {
        return await analyzeWithOpenAI(description);
      } else if (anthropic) {
        return await analyzeWithAnthropic(description);
      } else {
        // Final fallback: pattern matching
        return analyzeWithPatterns(description);
      }
    }
  } catch (error) {
    console.error('AI analysis failed, falling back:', error);
    
    // Try fallback providers
    try {
      if (preferredProvider === 'openai' && anthropic) {
        return await analyzeWithAnthropic(description);
      } else if (preferredProvider === 'anthropic' && openai) {
        return await analyzeWithOpenAI(description);
      } else {
        return analyzeWithPatterns(description);
      }
    } catch (fallbackError) {
      console.error('All AI methods failed:', fallbackError);
      return analyzeWithPatterns(description);
    }
  }
}

// ============================================================================
// OpenAI Analysis
// ============================================================================

async function analyzeWithOpenAI(description: string): Promise<JobAnalysisResult> {
  try {
    const prompt = buildExtractionPrompt(description);
    
    const response = await openai!.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruitment AI that extracts structured data from job descriptions. Always return valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    return {
      success: true,
      confidence: calculateConfidence(parsed),
      data: normalizeData(parsed),
      raw_response: content,
      extraction_method: 'openai'
    };
    
  } catch (error: any) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

// ============================================================================
// Anthropic Analysis
// ============================================================================

async function analyzeWithAnthropic(description: string): Promise<JobAnalysisResult> {
  try {
    const prompt = buildExtractionPrompt(description);
    
    const response = await anthropic!.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations.`
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response type from Anthropic');
    }

    // Clean up response (remove markdown if present)
    let jsonText = content.text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(jsonText);
    
    return {
      success: true,
      confidence: calculateConfidence(parsed),
      data: normalizeData(parsed),
      raw_response: content.text,
      extraction_method: 'anthropic'
    };
    
  } catch (error: any) {
    console.error('Anthropic analysis error:', error);
    throw error;
  }
}

// ============================================================================
// Pattern Matching Fallback
// ============================================================================

function analyzeWithPatterns(description: string): JobAnalysisResult {
  const text = description.toLowerCase();
  
  // Extract skills using common patterns
  const skills = extractSkillsWithPatterns(description);
  
  // Extract experience
  const experienceMatch = text.match(/(\d+)[\s\-+]*(?:to|or)?[\s\-]*(\d+)?[\s]*(?:years?|yrs?)/i);
  const experience_min = experienceMatch ? parseInt(experienceMatch[1]) : undefined;
  const experience_max = experienceMatch && experienceMatch[2] ? parseInt(experienceMatch[2]) : undefined;
  
  // Check for EU nationality requirement
  const requires_eu_nationality = /\b(eu|european)\s+(citizen|national|passport)\b/i.test(text) ||
                                   /\b(must|required|need)\s+.{0,20}\s+eu\b/i.test(text);
  
  // Check for work permit
  const requires_work_permit = /work\s+(?:permit|authorization|visa)/i.test(text);
  
  // Check for security clearance
  const requires_security_clearance = /security\s+clearance/i.test(text);
  
  // Extract location type
  let location_type: 'onsite' | 'remote' | 'hybrid' | undefined;
  if (/\b(remote|work from home|wfh)\b/i.test(text)) {
    location_type = 'remote';
  } else if (/\bhybrid\b/i.test(text)) {
    location_type = 'hybrid';
  } else if (/\b(onsite|on-site|office)\b/i.test(text)) {
    location_type = 'onsite';
  }
  
  // Extract contract duration
  const durationMatch = text.match(/(\d+)[\s\-]*(?:month|mo|months)/i);
  const duration_months = durationMatch ? parseInt(durationMatch[1]) : undefined;
  
  // Extract languages
  const languages = extractLanguagesWithPatterns(description);
  
  // Extract certifications
  const certifications = extractCertificationsWithPatterns(description);
  
  return {
    success: true,
    confidence: 0.6, // Pattern matching has lower confidence
    data: {
      skills_required: skills,
      certifications_required: certifications,
      languages_required: languages,
      experience_min,
      experience_max,
      location_type,
      requires_eu_nationality,
      requires_work_permit,
      requires_security_clearance,
      duration_months,
      key_responsibilities: [],
      nice_to_have_skills: []
    },
    extraction_method: 'pattern'
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildExtractionPrompt(description: string): string {
  return `
Extract the following information from this job description for a CONTRACTOR/FREELANCE position in a staffing consultancy:

Job Description:
"""
${description}
"""

Extract and return ONLY this JSON structure (no markdown, no explanations):

{
  "title": "extracted job title or null",
  "skills_required": ["skill1", "skill2"],
  "certifications_required": ["cert1", "cert2"],
  "languages_required": ["English", "German"],
  "experience_min": number or null,
  "experience_max": number or null,
  "location": "city, country" or null,
  "location_type": "onsite" or "remote" or "hybrid" or null,
  "requires_eu_nationality": boolean,
  "requires_work_permit": boolean,
  "requires_security_clearance": boolean,
  "duration_months": number or null,
  "suggested_bill_rate": number (daily rate in EUR) or null,
  "suggested_pay_rate": number (daily rate in EUR) or null,
  "salary_currency": "EUR" or "USD" or "GBP",
  "education_required": "Bachelor's" or "Master's" or null,
  "key_responsibilities": ["resp1", "resp2"],
  "nice_to_have_skills": ["skill1", "skill2"]
}

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown formatting
- Use null for fields that cannot be determined
- For skills, include both technical and soft skills
- For certifications, include any mentioned credentials
- For languages, include all required or preferred languages
- For EU nationality, check if EU citizenship is explicitly required
- Duration is in months (e.g., 6 for 6-month contract)
- Bill rate and pay rate are DAILY rates in the local currency
- Extract key responsibilities as separate bullet points
- Separate "must have" skills from "nice to have" skills
`;
}

function extractSkillsWithPatterns(text: string): string[] {
  const skills = new Set<string>();
  
  // Common tech skills
  const techSkills = [
    'react', 'angular', 'vue', 'node.js', 'python', 'java', 'c#', 'javascript',
    'typescript', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'sql', 'nosql',
    'mongodb', 'postgresql', 'redis', 'kafka', 'jenkins', 'ci/cd', 'devops',
    'agile', 'scrum', 'git', 'rest api', 'graphql', 'microservices', 'spring boot',
    'django', 'flask', 'express', 'next.js', 'tailwind', 'sass', 'webpack'
  ];
  
  const lowerText = text.toLowerCase();
  
  techSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      // Capitalize properly
      skills.add(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  
  return Array.from(skills);
}

function extractLanguagesWithPatterns(text: string): string[] {
  const languages = new Set<string>();
  
  const commonLanguages = [
    'english', 'german', 'french', 'spanish', 'italian', 'dutch',
    'portuguese', 'polish', 'russian', 'chinese', 'japanese', 'korean'
  ];
  
  const lowerText = text.toLowerCase();
  
  commonLanguages.forEach(lang => {
    if (lowerText.includes(lang)) {
      languages.add(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  });
  
  return Array.from(languages);
}

function extractCertificationsWithPatterns(text: string): string[] {
  const certs = new Set<string>();
  
  const commonCerts = [
    'AWS Certified', 'Azure Certified', 'GCP Certified', 'PMP', 'PRINCE2',
    'Scrum Master', 'Agile Certified', 'ITIL', 'CISSP', 'CEH', 'CompTIA'
  ];
  
  commonCerts.forEach(cert => {
    if (new RegExp(cert, 'i').test(text)) {
      certs.add(cert);
    }
  });
  
  return Array.from(certs);
}

function calculateConfidence(data: any): number {
  let score = 0;
  let total = 0;
  
  // Check each field for completeness
  const fields = [
    'title', 'skills_required', 'experience_min', 'location', 
    'location_type', 'duration_months'
  ];
  
  fields.forEach(field => {
    total += 1;
    if (data[field]) {
      if (Array.isArray(data[field])) {
        if (data[field].length > 0) score += 1;
      } else {
        score += 1;
      }
    }
  });
  
  return Math.round((score / total) * 100) / 100; // 0-1 scale
}

function normalizeData(data: any): JobAnalysisResult['data'] {
  return {
    title: data.title || undefined,
    skills_required: Array.isArray(data.skills_required) ? data.skills_required : [],
    certifications_required: Array.isArray(data.certifications_required) ? data.certifications_required : [],
    languages_required: Array.isArray(data.languages_required) ? data.languages_required : [],
    experience_min: data.experience_min || undefined,
    experience_max: data.experience_max || undefined,
    location: data.location || undefined,
    location_type: data.location_type || undefined,
    requires_eu_nationality: Boolean(data.requires_eu_nationality),
    requires_work_permit: Boolean(data.requires_work_permit),
    requires_security_clearance: Boolean(data.requires_security_clearance),
    duration_months: data.duration_months || undefined,
    suggested_bill_rate: data.suggested_bill_rate || undefined,
    suggested_pay_rate: data.suggested_pay_rate || undefined,
    salary_currency: data.salary_currency || 'EUR',
    education_required: data.education_required || undefined,
    key_responsibilities: Array.isArray(data.key_responsibilities) ? data.key_responsibilities : [],
    nice_to_have_skills: Array.isArray(data.nice_to_have_skills) ? data.nice_to_have_skills : []
  };
}

function getEmptyData(): JobAnalysisResult['data'] {
  return {
    skills_required: [],
    certifications_required: [],
    languages_required: [],
    requires_eu_nationality: false,
    requires_work_permit: false,
    requires_security_clearance: false,
    key_responsibilities: [],
    nice_to_have_skills: []
  };
}

// ============================================================================
// Quick Analysis (for real-time suggestions)
// ============================================================================

export async function quickAnalyze(description: string): Promise<{
  skills: string[];
  title_suggestion: string;
}> {
  // Quick pattern-based analysis for real-time suggestions
  const skills = extractSkillsWithPatterns(description);
  
  // Simple title extraction
  const firstLine = description.split('\n')[0].trim();
  const title_suggestion = firstLine.length > 5 && firstLine.length < 100 
    ? firstLine 
    : 'Untitled Position';
  
  return { skills, title_suggestion };
}
