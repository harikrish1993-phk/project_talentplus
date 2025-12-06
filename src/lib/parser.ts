import OpenAI from 'openai';
import { Candidate } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  skills: string[];
  years_of_experience?: number;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduation_date?: string;
    gpa?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface ParseResult {
  success: boolean;
  data?: Partial<Candidate>;
  confidence?: number;
  error?: string;
}

export async function parseResume(
  resumeText: string,
  fileName?: string
): Promise<ParseResult> {
  try {
    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Resume text is too short or empty',
      };
    }

    const prompt = `You are an expert resume parser. Extract structured information from the following resume text.
Return ONLY valid JSON with no additional text or explanation.

Resume Text:
${resumeText}

Extract the following information in this exact JSON format:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, State/Country",
  "title": "Current Job Title",
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", "skill3"],
  "years_of_experience": 5,
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "start_date": "2020-01",
      "end_date": "2023-12",
      "description": "Job description",
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University Name",
      "location": "City, State",
      "graduation_date": "2018-05",
      "gpa": "3.8"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "2022-06"
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiency": "Native"
    }
  ],
  "linkedin_url": "https://linkedin.com/in/username",
  "github_url": "https://github.com/username",
  "portfolio_url": "https://portfolio.com"
}

Rules:
- Extract ALL information available in the resume
- Use null for missing fields
- For dates, use YYYY-MM format
- Skills should be specific technical or professional skills
- Calculate years_of_experience from work history
- Be thorough and accurate`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract structured data from resumes and return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    const parsed: ParsedResume = JSON.parse(content);

    // Calculate confidence score based on completeness
    const confidence = calculateConfidence(parsed);

    // Transform to Candidate format
    const candidate: Partial<Candidate> = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || null,
      location: parsed.location || null,
      title: parsed.title || null,
      summary: parsed.summary || null,
      skills: parsed.skills || [],
      years_of_experience: parsed.years_of_experience || calculateExperience(parsed.experience),
      experience: parsed.experience || [],
      education: parsed.education || [],
      linkedin_url: parsed.linkedin_url || null,
      parse_confidence: confidence,
      resume_text: resumeText,
      source: 'upload',
      status: 'active',
    };

    return {
      success: true,
      data: candidate,
      confidence,
    };
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse resume',
    };
  }
}

function calculateConfidence(parsed: ParsedResume): number {
  let score = 0;
  const weights = {
    name: 15,
    email: 15,
    phone: 5,
    location: 5,
    title: 10,
    summary: 5,
    skills: 15,
    experience: 20,
    education: 10,
  };

  if (parsed.name && parsed.name.trim().length > 0) score += weights.name;
  if (parsed.email && parsed.email.includes('@')) score += weights.email;
  if (parsed.phone) score += weights.phone;
  if (parsed.location) score += weights.location;
  if (parsed.title) score += weights.title;
  if (parsed.summary && parsed.summary.length > 20) score += weights.summary;
  if (parsed.skills && parsed.skills.length >= 3) score += weights.skills;
  if (parsed.experience && parsed.experience.length > 0) score += weights.experience;
  if (parsed.education && parsed.education.length > 0) score += weights.education;

  return Math.min(100, score);
}

function calculateExperience(
  experience: ParsedResume['experience']
): number {
  if (!experience || experience.length === 0) return 0;

  let totalMonths = 0;
  const now = new Date();

  for (const exp of experience) {
    const startDate = new Date(exp.start_date + '-01');
    const endDate = exp.end_date ? new Date(exp.end_date + '-01') : now;

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}

export async function analyzeResumeAuthenticity(
  resumeText: string,
  candidate: Partial<Candidate>
): Promise<{
  score: number;
  flags: string[];
  analysis: string;
}> {
  try {
    const prompt = `Analyze this resume for authenticity and potential red flags.

Resume Text:
${resumeText}

Candidate Info:
Name: ${candidate.name}
Email: ${candidate.email}
Experience: ${candidate.years_of_experience} years
Skills: ${candidate.skills?.join(', ')}

Analyze for:
1. Consistency in dates and timeline
2. Realistic progression in roles and responsibilities
3. Appropriate skill levels for experience
4. Grammar and professionalism
5. Potential exaggerations or inconsistencies

Return JSON:
{
  "score": 85,
  "flags": ["flag1", "flag2"],
  "analysis": "Detailed analysis"
}

Score: 0-100 (100 = highly authentic, 0 = likely fraudulent)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at detecting resume fraud and inconsistencies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        score: 50,
        flags: ['Unable to analyze'],
        analysis: 'Analysis failed',
      };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Authenticity analysis error:', error);
    return {
      score: 50,
      flags: ['Analysis error'],
      analysis: 'Unable to complete authenticity check',
    };
  }
}
