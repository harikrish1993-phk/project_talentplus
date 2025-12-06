// ============================================================================
// Resume Parser - AI-Powered Resume Parsing
// Path: lib/ai/resume-parser.ts
// ============================================================================

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Types
// ============================================================================

export interface ParsedResume {
  success: boolean;
  confidence: number;
  data: {
    // Personal Information
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    
    // Professional Summary
    summary?: string;
    current_title?: string;
    current_employer?: string;
    total_experience_years?: number;
    
    // Skills
    skills: string[];
    technical_skills: string[];
    soft_skills: string[];
    languages: string[];
    certifications: string[];
    
    // Work Experience
    work_experience: Array<{
      title: string;
      company: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      current?: boolean;
      description?: string;
      achievements?: string[];
    }>;
    
    // Education
    education: Array<{
      degree: string;
      institution: string;
      field_of_study?: string;
      graduation_date?: string;
      gpa?: string;
    }>;
    
    // Additional
    willing_to_relocate?: boolean;
    preferred_locations?: string[];
    expected_salary?: number;
    salary_currency?: string;
    availability?: string;
  };
  raw_text?: string;
  extraction_method: 'openai' | 'anthropic' | 'pattern' | 'manual';
  error?: string;
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
// Main Parse Function
// ============================================================================

export async function parseResume(
  resumeText: string,
  preferredProvider: 'openai' | 'anthropic' = 'openai'
): Promise<ParsedResume> {
  
  if (!resumeText || resumeText.trim().length < 100) {
    return {
      success: false,
      confidence: 0,
      data: getEmptyData(),
      error: 'Resume text too short (minimum 100 characters)',
      extraction_method: 'manual'
    };
  }

  try {
    if (preferredProvider === 'openai' && openai) {
      return await parseWithOpenAI(resumeText);
    } else if (preferredProvider === 'anthropic' && anthropic) {
      return await parseWithAnthropic(resumeText);
    } else {
      if (openai) {
        return await parseWithOpenAI(resumeText);
      } else if (anthropic) {
        return await parseWithAnthropic(resumeText);
      } else {
        return parseWithPatterns(resumeText);
      }
    }
  } catch (error) {
    console.error('Resume parsing failed:', error);
    try {
      if (preferredProvider === 'openai' && anthropic) {
        return await parseWithAnthropic(resumeText);
      } else if (preferredProvider === 'anthropic' && openai) {
        return await parseWithOpenAI(resumeText);
      } else {
        return parseWithPatterns(resumeText);
      }
    } catch (fallbackError) {
      return parseWithPatterns(resumeText);
    }
  }
}

// ============================================================================
// OpenAI Parsing
// ============================================================================

async function parseWithOpenAI(resumeText: string): Promise<ParsedResume> {
  const prompt = buildParsingPrompt(resumeText);
  
  const response = await openai!.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume parser. Extract structured data from resumes. Return valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 3000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content);
  
  return {
    success: true,
    confidence: calculateConfidence(parsed),
    data: normalizeData(parsed),
    raw_text: resumeText,
    extraction_method: 'openai'
  };
}

// ============================================================================
// Anthropic Parsing
// ============================================================================

async function parseWithAnthropic(resumeText: string): Promise<ParsedResume> {
  const prompt = buildParsingPrompt(resumeText);
  
  const response = await anthropic!.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nReturn ONLY valid JSON, no markdown.`
      }
    ]
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Invalid response type');

  let jsonText = content.text.trim();
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  const parsed = JSON.parse(jsonText);
  
  return {
    success: true,
    confidence: calculateConfidence(parsed),
    data: normalizeData(parsed),
    raw_text: resumeText,
    extraction_method: 'anthropic'
  };
}

// ============================================================================
// Pattern Matching Fallback
// ============================================================================

function parseWithPatterns(resumeText: string): ParsedResume {
  const text = resumeText.toLowerCase();
  
  // Extract email
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : undefined;
  
  // Extract phone
  const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;
  
  // Extract LinkedIn
  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
  const linkedin_url = linkedinMatch ? `https://${linkedinMatch[0]}` : undefined;
  
  // Extract skills using common patterns
  const skills = extractSkillsWithPatterns(resumeText);
  
  // Calculate experience
  const experienceMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s+)?experience/i);
  const total_experience_years = experienceMatch ? parseInt(experienceMatch[1]) : undefined;
  
  return {
    success: true,
    confidence: 0.5,
    data: {
      email,
      phone,
      linkedin_url,
      skills,
      technical_skills: skills.filter(s => isTechnicalSkill(s)),
      soft_skills: [],
      languages: extractLanguages(resumeText),
      certifications: [],
      total_experience_years,
      work_experience: [],
      education: [],
    },
    raw_text: resumeText,
    extraction_method: 'pattern'
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildParsingPrompt(resumeText: string): string {
  return `
Parse this resume and extract all information into structured JSON:

Resume Text:
"""
${resumeText}
"""

Extract and return this JSON structure:

{
  "first_name": "string or null",
  "last_name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "city, country or null",
  "linkedin_url": "string or null",
  "github_url": "string or null",
  "portfolio_url": "string or null",
  "summary": "professional summary or null",
  "current_title": "current job title or null",
  "current_employer": "current company or null",
  "total_experience_years": number or null,
  "skills": ["skill1", "skill2"],
  "technical_skills": ["tech1", "tech2"],
  "soft_skills": ["skill1", "skill2"],
  "languages": ["English", "German"],
  "certifications": ["cert1", "cert2"],
  "work_experience": [
    {
      "title": "job title",
      "company": "company name",
      "location": "location or null",
      "start_date": "YYYY-MM or null",
      "end_date": "YYYY-MM or null",
      "current": boolean,
      "description": "description or null",
      "achievements": ["achievement1"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "field_of_study": "field or null",
      "graduation_date": "YYYY or null",
      "gpa": "gpa or null"
    }
  ],
  "willing_to_relocate": boolean or null,
  "preferred_locations": ["location1"] or null,
  "expected_salary": number or null,
  "salary_currency": "EUR/USD/GBP" or null,
  "availability": "immediate/2 weeks/1 month" or null
}

IMPORTANT:
- Return ONLY valid JSON
- Use null for missing fields
- Extract ALL work experience with dates
- Separate technical skills from soft skills
- Include all certifications mentioned
- Parse dates as best as possible
`;
}

function extractSkillsWithPatterns(text: string): string[] {
  const skills = new Set<string>();
  
  const techSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'DevOps',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Git', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'Microservices',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'Webpack', 'Vite'
  ];
  
  const lowerText = text.toLowerCase();
  
  techSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });
  
  return Array.from(skills);
}

function extractLanguages(text: string): string[] {
  const languages = new Set<string>();
  const commonLanguages = [
    'English', 'German', 'French', 'Spanish', 'Italian', 'Dutch',
    'Portuguese', 'Polish', 'Russian', 'Chinese', 'Japanese', 'Korean'
  ];
  
  const lowerText = text.toLowerCase();
  
  commonLanguages.forEach(lang => {
    if (lowerText.includes(lang.toLowerCase())) {
      languages.add(lang);
    }
  });
  
  return Array.from(languages);
}

function isTechnicalSkill(skill: string): boolean {
  const technicalKeywords = [
    'js', 'script', 'sql', 'api', 'cloud', 'web', 'mobile', 'dev',
    'framework', 'library', 'database', 'server', 'ci', 'cd'
  ];
  
  const lowerSkill = skill.toLowerCase();
  return technicalKeywords.some(keyword => lowerSkill.includes(keyword));
}

function calculateConfidence(data: any): number {
  let score = 0;
  let total = 0;
  
  const fields = [
    'first_name', 'last_name', 'email', 'phone', 'skills',
    'work_experience', 'education', 'total_experience_years'
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
  
  return Math.round((score / total) * 100) / 100;
}

function normalizeData(data: any): ParsedResume['data'] {
  return {
    first_name: data.first_name || undefined,
    last_name: data.last_name || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    location: data.location || undefined,
    linkedin_url: data.linkedin_url || undefined,
    github_url: data.github_url || undefined,
    portfolio_url: data.portfolio_url || undefined,
    summary: data.summary || undefined,
    current_title: data.current_title || undefined,
    current_employer: data.current_employer || undefined,
    total_experience_years: data.total_experience_years || undefined,
    skills: Array.isArray(data.skills) ? data.skills : [],
    technical_skills: Array.isArray(data.technical_skills) ? data.technical_skills : [],
    soft_skills: Array.isArray(data.soft_skills) ? data.soft_skills : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    willing_to_relocate: data.willing_to_relocate,
    preferred_locations: Array.isArray(data.preferred_locations) ? data.preferred_locations : undefined,
    expected_salary: data.expected_salary || undefined,
    salary_currency: data.salary_currency || 'EUR',
    availability: data.availability || undefined,
  };
}

function getEmptyData(): ParsedResume['data'] {
  return {
    skills: [],
    technical_skills: [],
    soft_skills: [],
    languages: [],
    certifications: [],
    work_experience: [],
    education: [],
  };
}

// ============================================================================
// Extract Text from PDF/DOCX (placeholder - implement with pdf-parse/mammoth)
// ============================================================================

export async function extractTextFromFile(file: File): Promise<string> {
  // This would use pdf-parse for PDFs or mammoth for DOCX
  // For now, return placeholder
  throw new Error('File parsing not yet implemented. Please paste resume text.');
}
