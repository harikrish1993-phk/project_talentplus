// =============================================================================
// TalentPulse AI - TypeScript Type Definitions
// =============================================================================

// User Roles (internal)
export type UserRole = 
  | 'super_admin'
  | 'manager'
  | 'senior_recruiter'
  | 'recruiter'
  | 'coordinator';

// Role Display Labels (business-friendly)
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Company Administrator',
  manager: 'Recruitment Manager',
  senior_recruiter: 'Senior Recruiter',
  recruiter: 'Recruiter',
  coordinator: 'Recruitment Coordinator',
};

// Role Descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system access including billing, settings, and user management',
  manager: 'Manage team performance, view reports, and oversee recruitment operations',
  senior_recruiter: 'Full access to jobs, candidates, and submissions with advanced features',
  recruiter: 'Create jobs, manage candidates, and handle submissions',
  coordinator: 'View-only access for scheduling and coordination support',
};

// ============================================================================
// SUBMISSION STATUSES
// ============================================================================

export type SubmissionStatus = 
  | 'new'
  | 'initial_review'
  | 'internal_review'
  | 'ready_for_client'
  | 'submitted_to_client'
  | 'client_review'
  | 'interview_scheduled'
  | 'interview_complete'
  | 'offer_made'
  | 'offer_accepted'
  | 'placed'
  | 'not_selected';

// Status Display Labels (business-friendly)
export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New Submission',
  initial_review: 'Initial Review',
  internal_review: 'Internal Review',
  ready_for_client: 'Ready for Client',
  submitted_to_client: 'Submitted to Client',
  client_review: 'Under Client Review',
  interview_scheduled: 'Interview Scheduled',
  interview_complete: 'Interview Complete',
  offer_made: 'Offer Made',
  offer_accepted: 'Offer Accepted',
  placed: 'Placed',
  not_selected: 'Not Selected',
};

// Status Descriptions (tooltip text)
export const STATUS_DESCRIPTIONS: Record<SubmissionStatus, string> = {
  new: 'Candidate just submitted for this position',
  initial_review: 'Under initial internal evaluation',
  internal_review: 'Being reviewed by the recruitment team',
  ready_for_client: 'Approved and ready to send to client',
  submitted_to_client: 'Sent to client for consideration',
  client_review: 'Client is currently reviewing this candidate',
  interview_scheduled: 'Interview has been scheduled',
  interview_complete: 'Interview has been completed',
  offer_made: 'Job offer has been extended',
  offer_accepted: 'Candidate has accepted the offer',
  placed: 'Successfully placed in the position',
  not_selected: 'Will not be moving forward',
};

// Status Colors (for badges)
export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  initial_review: 'bg-purple-100 text-purple-800',
  internal_review: 'bg-indigo-100 text-indigo-800',
  ready_for_client: 'bg-cyan-100 text-cyan-800',
  submitted_to_client: 'bg-yellow-100 text-yellow-800',
  client_review: 'bg-orange-100 text-orange-800',
  interview_scheduled: 'bg-pink-100 text-pink-800',
  interview_complete: 'bg-violet-100 text-violet-800',
  offer_made: 'bg-lime-100 text-lime-800',
  offer_accepted: 'bg-emerald-100 text-emerald-800',
  placed: 'bg-green-100 text-green-800',
  not_selected: 'bg-gray-100 text-gray-800',
};

// ============================================================================
// JOB STATUSES
// ============================================================================

export type JobStatus = 'draft' | 'open' | 'on_hold' | 'closed' | 'filled';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  on_hold: 'On Hold',
  closed: 'Closed',
  filled: 'Position Filled',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800',
  filled: 'bg-blue-100 text-blue-800',
};

// ============================================================================
// CANDIDATE STATUSES
// ============================================================================

export type CandidateStatus = 'active' | 'placed' | 'inactive' | 'archived';

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  active: 'Active',
  placed: 'Placed',
  inactive: 'Inactive',
  archived: 'Archived',
};

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export type ActivityType =
  | 'job_created'
  | 'job_updated'
  | 'job_closed'
  | 'candidate_added'
  | 'candidate_updated'
  | 'resume_uploaded'
  | 'resume_extracted'
  | 'submission_created'
  | 'submission_status_changed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'client_added'
  | 'user_invited'
  | 'settings_changed';

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  job_created: 'Job Created',
  job_updated: 'Job Updated',
  job_closed: 'Job Closed',
  candidate_added: 'Candidate Added',
  candidate_updated: 'Candidate Updated',
  resume_uploaded: 'Resume Uploaded',
  resume_extracted: 'Resume Information Extracted',
  submission_created: 'Submission Created',
  submission_status_changed: 'Submission Status Changed',
  interview_scheduled: 'Interview Scheduled',
  interview_completed: 'Interview Completed',
  client_added: 'Client Added',
  user_invited: 'Team Member Invited',
  settings_changed: 'Settings Updated',
};

// ============================================================================
// ERROR MESSAGES (Business-Friendly)
// ============================================================================

export const ERROR_MESSAGES = {
  // Network errors
  network: {
    timeout: 'The request took too long. Please try again.',
    offline: 'You appear to be offline. Please check your connection.',
    server: 'We\'re having trouble connecting. Please try again in a moment.',
  },
  
  // Authentication errors
  auth: {
    unauthorized: 'You don\'t have permission to access this.',
    session_expired: 'Your session has expired. Please sign in again.',
    invalid_credentials: 'Incorrect email or password. Please try again.',
  },
  
  // Data errors
  data: {
    not_found: 'We couldn\'t find what you\'re looking for.',
    validation: 'Please check your information and try again.',
    duplicate: 'This already exists in the system.',
  },
  
  // AI errors
  ai: {
    extraction_failed: 'We couldn\'t read this resume. Please try uploading a PDF or Word document.',
    matching_failed: 'We couldn\'t find any matching candidates. Try adjusting your criteria.',
    rate_limit: 'You\'ve reached your usage limit. Please try again later or upgrade your plan.',
  },
  
  // Upload errors
  upload: {
    too_large: 'This file is too large. Maximum size is 10MB.',
    invalid_format: 'This file format isn\'t supported. Please use PDF or Word documents.',
    failed: 'The upload failed. Please try again.',
  },
};

// ============================================================================
// SUCCESS MESSAGES (Business-Friendly)
// ============================================================================

export const SUCCESS_MESSAGES = {
  job: {
    created: 'Job created successfully!',
    updated: 'Job updated successfully!',
    closed: 'Job closed successfully!',
  },
  candidate: {
    created: 'Candidate added successfully!',
    updated: 'Candidate updated successfully!',
    uploaded: 'Resume uploaded successfully!',
  },
  submission: {
    created: 'Submission created successfully!',
    updated: 'Submission updated successfully!',
    sent_to_client: 'Submission sent to client successfully!',
  },
  interview: {
    scheduled: 'Interview scheduled successfully!',
    updated: 'Interview updated successfully!',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get business-friendly label for any status
 */
export function getStatusLabel(status: SubmissionStatus | JobStatus | CandidateStatus): string {
  if (status in STATUS_LABELS) {
    return STATUS_LABELS[status as SubmissionStatus];
  }
  if (status in JOB_STATUS_LABELS) {
    return JOB_STATUS_LABELS[status as JobStatus];
  }
  if (status in CANDIDATE_STATUS_LABELS) {
    return CANDIDATE_STATUS_LABELS[status as CandidateStatus];
  }
  return status;
}

/**
 * Get business-friendly role label
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Get business-friendly activity label
 */
export function getActivityLabel(activity: ActivityType): string {
  return ACTIVITY_LABELS[activity] || activity;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  // Check for specific error types
  if (error.message) {
    // Network errors
    if (error.message.includes('timeout')) return ERROR_MESSAGES.network.timeout;
    if (error.message.includes('offline')) return ERROR_MESSAGES.network.offline;
    
    // Auth errors
    if (error.message.includes('Unauthorized')) return ERROR_MESSAGES.auth.unauthorized;
    if (error.message.includes('credentials')) return ERROR_MESSAGES.auth.invalid_credentials;
    
    // Data errors
    if (error.message.includes('not found')) return ERROR_MESSAGES.data.not_found;
    if (error.message.includes('duplicate')) return ERROR_MESSAGES.data.duplicate;
  }
  
  // Default friendly message
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}
// Database enums
export type JobType = 'full_time' | 'freelance' | 'contract' | 'temporary' | 'internship';
export type JobLocationType = 'onsite' | 'remote' | 'hybrid';

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type InterviewType = 'phone_screen' | 'technical' | 'behavioral' | 'panel' | 'final' | 'client_interview';
export type CandidateSource = 'linkedin' | 'referral' | 'job_board' | 'company_website' | 'agency' | 'direct' | 'other';
export type RTRStatus = 'pending' | 'approved' | 'rejected' | 'expired';

// -----------------------------------------------------------------------------
// Core Entities
// -----------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  billing_email?: string;
  settings: Record<string, any>;
  branding: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  is_active: boolean;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  permissions: string[];
  title?: string;
  department?: string;
  bio?: string;
  linkedin_url?: string;
  preferences: Record<string, any>;
  notification_settings: Record<string, any>;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  organization?: Organization;
}

export interface Client {
  id: string;
  organization_id: string;
  name: string;
  industry?: string;
  company_size?: string;
  website?: string;
  logo_url?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  payment_terms?: string;
  preferred_payment_method?: string;
  account_manager_id?: string;
  relationship_status: string;
  client_since?: Date;
  billing_rate_currency: string;
  notes?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  is_active: boolean;
  
  // Relations
  account_manager?: User;
  jobs?: Job[];
}

export interface Job {
  id: string;
  organization_id: string;
  client_id: string;
  title: string;
  job_code?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  job_type: JobType;
  job_status: JobStatus;
  location_type: JobLocationType;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  remote_policy?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  bill_rate?: number;
  pay_rate?: number;
  margin_percentage?: number;
  bonus_structure?: string;
  benefits?: string;
  equity_offered: boolean;
  experience_min?: number;
  experience_max?: number;
  education_required?: string;
  certifications_required: string[];
  skills_required: string[];
  skills_preferred: string[];
  languages_required: string[];
  positions_available: number;
  positions_filled: number;
  priority: string;
  target_start_date?: Date;
  application_deadline?: Date;
  hiring_manager_id?: string;
  recruiters: string[];
  requires_rtr: boolean;
  requires_pre_screening: boolean;
  approval_required: boolean;
  is_published: boolean;
  published_at?: Date;
  external_job_boards: string[];
  tags: string[];
  custom_fields: Record<string, any>;
  ai_matching_criteria: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  closed_at?: Date;
  closed_reason?: string;
  
  // Relations
  client?: Client;
  hiring_manager?: User;
  submissions?: Submission[];
  assigned_recruiters?: User[];
}

export interface Candidate {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  alternate_phone?: string;
  current_location?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  willing_to_relocate: boolean;
  current_title?: string;
  current_employer?: string;
  total_experience_years?: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  resume_filename?: string;
  resume_uploaded_at?: Date;
  parsed_resume_data?: Record<string, any>;
  skills: string[];
  certifications: string[];
  education: EducationEntry[];
  languages: string[];
  current_salary?: number;
  expected_salary_min?: number;
  expected_salary_max?: number;
  salary_currency: string;
  notice_period_days?: number;
  available_from?: Date;
  work_authorization?: string;
  visa_status?: string;
  security_clearance?: string;
  source: CandidateSource;
  source_details?: string;
  assigned_recruiter_id?: string;
  ai_summary?: string;
  ai_skills_extracted: string[];
  ai_match_score?: number;
  is_active: boolean;
  is_blacklisted: boolean;
  blacklist_reason?: string;
  do_not_contact: boolean;
  tags: string[];
  notes?: string;
  custom_fields: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  last_contacted_at?: Date;
  
  // Relations
  assigned_recruiter?: User;
  submissions?: Submission[];
}

export interface EducationEntry {
  degree: string;
  field_of_study?: string;
  institution: string;
  start_date?: string;
  end_date?: string;
  gpa?: number;
  honors?: string;
}

export interface Submission {
  id: string;
  organization_id: string;
  job_id: string;
  candidate_id: string;
  status: SubmissionStatus;
  previous_status?: SubmissionStatus;
  status_changed_at: Date;
  rtr_status?: RTRStatus;
  rtr_requested_at?: Date;
  rtr_approved_at?: Date;
  rtr_expires_at?: Date;
  rtr_document_url?: string;
  pre_screening_completed: boolean;
  pre_screening_completed_at?: Date;
  pre_screening_score?: number;
  pre_screening_notes?: string;
  pre_screening_passed?: boolean;
  internal_review_status?: string;
  internal_reviewer_id?: string;
  internal_review_notes?: string;
  internal_review_completed_at?: Date;
  internal_review_approved?: boolean;
  submitted_to_client_at?: Date;
  submitted_to_client_by?: string;
  client_feedback?: string;
  client_feedback_received_at?: Date;
  ai_match_score?: number;
  ai_match_reasons: Record<string, any>[];
  ai_skill_match: Record<string, any>;
  recruiter_id: string;
  team_lead_id?: string;
  proposed_bill_rate?: number;
  proposed_pay_rate?: number;
  proposed_margin_percentage?: number;
  bill_rate?: number;  // Actual bill rate (for SubmissionKanban)
  pay_rate?: number;   // Actual pay rate (for SubmissionKanban)
  margin?: number;     // Actual margin (for SubmissionKanban)
  submission_notes?: string;
  attachments: Attachment[];
  timeline: TimelineEntry[];
  created_at: Date;
  updated_at: Date;
  withdrawn_at?: Date;
  withdrawn_by?: string;
  withdrawn_reason?: string;
  
  // Relations
  job?: Job;
  candidate?: Candidate;
  client?: Client;  // Client relation (for SubmissionKanban)
  recruiter?: User;
  team_lead?: User;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  organization_id: string;
  submission_id: string;
  job_id: string;
  candidate_id: string;
  interview_type: InterviewType;
  interview_status: InterviewStatus;
  scheduled_at: Date;
  duration_minutes: number;
  timezone?: string;
  end_time?: Date;
  is_virtual: boolean;
  meeting_link?: string;
  meeting_password?: string;
  location?: string;
  address?: string;
  interviewer_ids: string[];
  organizer_id?: string;
  is_client_interview: boolean;
  client_interviewer_name?: string;
  client_interviewer_email?: string;
  feedback?: string;
  rating?: number;
  recommendation?: string;
  strengths?: string;
  concerns?: string;
  followup_required: boolean;
  followup_notes?: string;
  next_steps?: string;
  completed_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  no_show_reason?: string;
  reminder_sent: boolean;
  reminder_sent_at?: Date;
  attachments: Attachment[];
  custom_fields: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  
  // Relations
  submission?: Submission;
  job?: Job;
  candidate?: Candidate;
  interviewers?: User[];
  organizer?: User;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  description?: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface EmailTemplate {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  subject: string;
  body_html: string;
  body_text?: string;
  available_variables: string[];
  is_active: boolean;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface EmailQueue {
  id: string;
  organization_id: string;
  template_id?: string;
  to_email: string;
  to_name?: string;
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body_html: string;
  body_text?: string;
  attachments: Attachment[];
  related_entity_type?: string;
  related_entity_id?: string;
  status: string;
  priority: number;
  scheduled_at?: Date;
  attempts: number;
  max_attempts: number;
  last_attempt_at?: Date;
  error_message?: string;
  sent_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  created_at: Date;
}

// -----------------------------------------------------------------------------
// Helper Types
// -----------------------------------------------------------------------------

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: Date;
}

export interface TimelineEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  user_id?: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// -----------------------------------------------------------------------------
// Filter & Search Types
// -----------------------------------------------------------------------------

export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface JobFilters extends BaseFilters {
  client_id?: string;
  status?: JobStatus[];
  job_type?: JobType[];
  location_type?: JobLocationType[];
  recruiter_id?: string;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  is_published?: boolean;
}

export interface CandidateFilters extends BaseFilters {
  source?: CandidateSource[];
  assigned_recruiter_id?: string;
  skills?: string[];
  experience_min?: number;
  experience_max?: number;
  expected_salary_max?: number;
  is_active?: boolean;
  is_blacklisted?: boolean;
}

export interface SubmissionFilters extends BaseFilters {
  job_id?: string;
  candidate_id?: string;
  status?: SubmissionStatus[];
  recruiter_id?: string;
  min_match_score?: number;
  date_from?: Date;
  date_to?: Date;
}

// -----------------------------------------------------------------------------
// Form Types
// -----------------------------------------------------------------------------

export interface CreateJobData {
  client_id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  job_type: JobType;
  location_type: JobLocationType;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  salary_min?: number;
  salary_max?: number;
  bill_rate?: number;
  pay_rate?: number;
  skills_required: string[];
  skills_preferred?: string[];
  experience_min?: number;
  experience_max?: number;
  positions_available?: number;
  hiring_manager_id?: string;
  recruiters?: string[];
}

export interface CreateCandidateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  current_location?: string;
  current_title?: string;
  total_experience_years?: number;
  skills?: string[];
  resume_file?: File;
  source: CandidateSource;
  assigned_recruiter_id?: string;
}

export interface CreateSubmissionData {
  job_id: string;
  candidate_id: string;
  submission_notes?: string;
  proposed_bill_rate?: number;
  proposed_pay_rate?: number;
}

// -----------------------------------------------------------------------------
// AI Types
// -----------------------------------------------------------------------------

export interface AIParseResumeResult {
  success: boolean;
  data?: {
    personal_info: {
      name: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
    };
    summary?: string;
    experience: Array<{
      title: string;
      company: string;
      start_date?: string;
      end_date?: string;
      description?: string;
    }>;
    education: EducationEntry[];
    skills: string[];
    certifications?: string[];
    languages?: string[];
  };
  error?: string;
  raw_text?: string;
}

export interface AIMatchCandidate {
  candidate_id: string;
  match_score: number;
  match_reasons: Array<{
    category: string;
    score: number;
    description: string;
  }>;
  skill_match: {
    matching_skills: string[];
    missing_skills: string[];
    additional_skills: string[];
  };
  recommendations?: string;
}

export interface AIFraudDetectionResult {
  is_suspicious: boolean;
  confidence: number;
  flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendation: string;
}

// -----------------------------------------------------------------------------
// Dashboard & Analytics Types
// -----------------------------------------------------------------------------

export interface DashboardStats {
  total_jobs: number;
  active_jobs: number;
  total_candidates: number;
  total_submissions: number;
  pending_interviews: number;
  placements_this_month: number;
  revenue_this_month: number;
  avg_time_to_hire: number;
}

export interface SubmissionsPipeline {
  status: SubmissionStatus;
  count: number;
  percentage: number;
}

export interface RecruiterPerformance {
  recruiter_id: string;
  recruiter_name: string;
  total_submissions: number;
  placements: number;
  placement_rate: number;
  avg_match_score: number;
}

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
}

// -----------------------------------------------------------------------------
// Export all types
// -----------------------------------------------------------------------------

export type { };