// Core Types for TalentPlus Recruitment System

// ============================================================================
// Job Types
// ============================================================================

export type JobStatus = 'draft' | 'open' | 'closed' | 'on_hold';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills_required: string[];
  location: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  status: JobStatus;
  client_id: string;
  client?: Client;
  created_by?: string;
  created_at: string;
  updated_at: string;
  submissions_count?: number;
  matches_count?: number;
}

export interface JobFormData {
  title: string;
  client_id: string;
  description: string;
  requirements: string[];
  skills_required: string[];
  location: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  status: JobStatus;
}

// ============================================================================
// Client Types
// ============================================================================

export interface Client {
  id: string;
  company_name: string;
  industry: string;
  website?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  active_jobs_count?: number;
  total_submissions?: number;
}

export interface ClientFormData {
  company_name: string;
  industry: string;
  website?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
}

// ============================================================================
// Candidate Types
// ============================================================================

export type CandidateSource = 'upload' | 'linkedin' | 'indeed' | 'referral' | 'direct' | 'other';
export type CandidateStatus = 'active' | 'placed' | 'inactive' | 'do_not_contact';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  skills: string[];
  years_of_experience: number;
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications?: CandidateCertification[];
  languages?: CandidateLanguage[];
  resume_url?: string;
  resume_filename?: string;
  parse_confidence: number;
  authenticity_score?: number;
  authenticity_risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  source: CandidateSource;
  status: CandidateStatus;
  created_at: string;
  updated_at: string;
  last_contacted?: string;
  notes?: string;
}

export interface CandidateExperience {
  id?: string;
  candidate_id?: string;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string[];
  skills_used?: string[];
}

export interface CandidateEducation {
  id?: string;
  candidate_id?: string;
  degree: string;
  field_of_study?: string;
  institution: string;
  location?: string;
  start_year: string;
  end_year?: string;
  is_current?: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface CandidateCertification {
  id?: string;
  candidate_id?: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface CandidateLanguage {
  language: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface AuthenticityReport {
  candidate_id: string;
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  redFlags: RedFlag[];
  greenFlags: string[];
  recommendations: string[];
  analysis: {
    experienceConsistency: number;
    skillsAlignment: number;
    educationVerification: number;
    careerProgression: number;
    detailQuality: number;
  };
  generated_at: string;
}

export interface RedFlag {
  flag: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

// ============================================================================
// Match Types
// ============================================================================

export type MatchStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'submitted';

export interface Match {
  id: string;
  job_id: string;
  candidate_id: string;
  score: number;
  reasoning: string;
  skill_matches: SkillMatch[];
  experience_match: number;
  location_match: boolean;
  status: MatchStatus;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  job?: Job;
  candidate?: Candidate;
}

export interface SkillMatch {
  skill: string;
  required: boolean;
  candidate_has: boolean;
  proficiency?: string;
}

export interface MatchRequest {
  job_id: string;
  candidate_ids?: string[];
  min_score?: number;
  limit?: number;
}

export interface MatchResult {
  job: Job;
  matches: Match[];
  total_candidates_evaluated: number;
  execution_time_ms: number;
}

// ============================================================================
// Submission Types
// ============================================================================

export type SubmissionStatus =
  | 'submitted'
  | 'client_reviewing'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'placed'
  | 'rejected'
  | 'withdrawn';

export interface Submission {
  id: string;
  job_id: string;
  candidate_id: string;
  client_id: string;
  status: SubmissionStatus;
  submitted_at: string;
  submitted_by?: string;
  client_feedback?: string;
  interview_date?: string;
  interview_notes?: string;
  offer_amount?: number;
  offer_currency?: string;
  placement_date?: string;
  rejection_reason?: string;
  notes?: string;
  updated_at: string;
  job?: Job;
  candidate?: Candidate;
  client?: Client;
}

export interface SubmissionFormData {
  job_id: string;
  candidate_id: string;
  client_id: string;
  notes?: string;
}

export interface SubmissionStatusUpdate {
  status: SubmissionStatus;
  client_feedback?: string;
  interview_date?: string;
  interview_notes?: string;
  offer_amount?: number;
  offer_currency?: string;
  placement_date?: string;
  rejection_reason?: string;
  notes?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardMetrics {
  active_jobs: number;
  total_candidates: number;
  pending_submissions: number;
  placements_this_month: number;
  conversion_rate: number;
  revenue_this_month?: number;
}

export interface ActivityItem {
  id: string;
  type: 'job_created' | 'candidate_added' | 'match_found' | 'submission_created' | 'submission_updated' | 'placement';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// ============================================================================
// User Types (for future implementation)
// ============================================================================

export type UserRole = 'admin' | 'owner' | 'team_lead' | 'recruiter';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  client_id?: string;
  job_id?: string;
  date_from?: string;
  date_to?: string;
  skills?: string[];
  location?: string;
  experience_level?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// ============================================================================
// View Types
// ============================================================================

export type ViewMode = 'grid' | 'list' | 'kanban';

export interface ViewPreferences {
  jobs_view: ViewMode;
  clients_view: 'grid' | 'list';
  candidates_view: 'grid' | 'list';
}

// ============================================================================
// Form State Types
// ============================================================================

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// Upload Types
// ============================================================================

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ParsedResume {
  candidate: Partial<Candidate>;
  confidence: number;
  warnings: string[];
}
