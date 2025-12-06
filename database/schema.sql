- ============================================================================
-- TalentPulse AI - Final Consolidated Database Schema
--
-- This schema consolidates the original tables, the missing tables from the
-- critical path implementation, and includes all necessary tables for a
-- production-ready, multi-tenant recruitment platform.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search (optional)

-- ----------------------------------------------------------------------------
-- 1. Multi-Tenancy: Organizations
-- ----------------------------------------------------------------------------

-- The core multi-tenancy unit. All data belongs to an organization.
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    billing_id text, -- Stripe/Billing ID
    subscription_level text DEFAULT 'free' NOT NULL,
    ai_budget_usd numeric DEFAULT 0.00 NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. Authentication & Users
-- ----------------------------------------------------------------------------

-- User roles for Role-Based Access Control (RBAC)
CREATE TYPE user_role AS ENUM ('administrator', 'team_lead', 'recruiter', 'viewer');

-- Users table linked to Supabase Auth (auth.users)
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email text UNIQUE NOT NULL,
    name text,
    role user_role DEFAULT 'recruiter' NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tokens for email verification
CREATE TABLE email_verification_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token text UNIQUE NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tokens for password reset
CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token text UNIQUE NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Security table to track login attempts
CREATE TABLE login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    ip_address inet,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL,
    is_successful boolean NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. Core Recruitment Entities
-- ----------------------------------------------------------------------------

-- Clients (for agency model)
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    contact_name text,
    contact_email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (organization_id, name)
);

-- Jobs (Job Postings)
CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'draft' NOT NULL, -- draft, active, closed, archived
    recruiter_id uuid REFERENCES users(id) ON DELETE SET NULL,
    salary_range text,
    location text,
    required_skills text[],
    ai_summary jsonb, -- AI-generated key requirements
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Candidates (The main library of resumes)
CREATE TABLE candidates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE,
    phone text,
    current_title text,
    current_company text,
    experience_years integer,
    skills text[],
    resume_text text, -- Full text of the resume
    resume_url text, -- URL to the stored resume file
    ai_parsed_data jsonb, -- Structured data from AI parsing
    source text, -- e.g., 'bulk_import', 'linkedin_extension', 'web_form'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Submissions (Candidate applied/submitted for a Job)
CREATE TABLE submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'submitted' NOT NULL, -- submitted, in_review, interview, offered, hired, rejected
    submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    match_score numeric, -- Final match score
    match_details jsonb, -- Detailed breakdown of the match
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (job_id, candidate_id)
);

-- ----------------------------------------------------------------------------
-- 4. AI & Review Workflow
-- ----------------------------------------------------------------------------

-- History of AI matching operations
CREATE TABLE match_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
    ai_model text NOT NULL,
    ai_score numeric NOT NULL,
    ai_details jsonb,
    cost_usd numeric DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Manual Review Workflow (Human-in-the-Loop)
CREATE TYPE review_type AS ENUM ('parsing_verification', 'match_verification', 'quality_check');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'corrected');

CREATE TABLE manual_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
    candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE SET NULL, -- Optional, for match reviews
    review_type review_type NOT NULL,
    status review_status DEFAULT 'pending' NOT NULL,
    ai_data_snapshot jsonb, -- Snapshot of AI data before review
    human_corrections jsonb, -- Structured corrections made by the reviewer
    feedback text, -- Free-form feedback for model training
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. Activity, Audit & Security
-- ----------------------------------------------------------------------------

-- Activity Log (Timeline of user actions)
CREATE TABLE activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL, -- e.g., 'create_job', 'login', 'import_candidate'
    entity_type text NOT NULL, -- e.g., 'job', 'candidate', 'user'
    entity_id uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Audit Log (Immutable record of changes for compliance)
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    changes jsonb, -- Before and after state of the change
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. Integrations & Settings
-- ----------------------------------------------------------------------------

-- API Keys for external access
CREATE TABLE api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    key_hash text UNIQUE NOT NULL, -- Hashed key
    is_active boolean DEFAULT true NOT NULL,
    permissions text[], -- Scoped permissions for the key
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Webhooks for real-time notifications
CREATE TABLE webhooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    secret text,
    events text[] NOT NULL, -- List of events to subscribe to
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Log of webhook delivery attempts
CREATE TABLE webhook_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
    event text NOT NULL,
    payload jsonb,
    response_status integer,
    response_body text,
    is_successful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Organization-level settings (AI config, branding, etc.)
CREATE TABLE organization_settings (
    organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    ai_provider text DEFAULT 'openai' NOT NULL,
    ai_model_parsing text DEFAULT 'gpt-4-turbo' NOT NULL,
    ai_model_matching text DEFAULT 'gpt-3.5-turbo' NOT NULL,
    ai_budget_monthly numeric DEFAULT 50.00 NOT NULL,
    branding_logo_url text,
    email_sender_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. Public Candidate Submission Form (New Feature)
-- ----------------------------------------------------------------------------

-- Table to store public job links for the form
CREATE TABLE public_job_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    public_slug text UNIQUE NOT NULL, -- The short, public URL part
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table to store submissions from the public form
CREATE TABLE public_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    job_link_id uuid REFERENCES public_job_links(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    resume_url text, -- URL to the uploaded resume
    consent_given boolean DEFAULT false NOT NULL,
    ip_address inet,
    user_agent text,
    status text DEFAULT 'new' NOT NULL, -- new, processed, linked_to_candidate
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. Indexes for Performance
-- ----------------------------------------------------------------------------

CREATE INDEX idx_users_organization_id ON users (organization_id);
CREATE INDEX idx_jobs_organization_id ON jobs (organization_id);
CREATE INDEX idx_candidates_organization_id ON candidates (organization_id);
CREATE INDEX idx_submissions_job_id ON submissions (job_id);
CREATE INDEX idx_submissions_candidate_id ON submissions (candidate_id);
CREATE INDEX idx_activities_organization_id ON activities (organization_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs (organization_id);
CREATE INDEX idx_manual_reviews_candidate_id ON manual_reviews (candidate_id);
CREATE INDEX idx_public_submissions_job_link_id ON public_submissions (job_link_id);

-- ----------------------------------------------------------------------------
-- 9. Triggers (Optional but Recommended for updated_at)
-- ----------------------------------------------------------------------------

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 10. Row Level Security (RLS) Policy Placeholders
-- ----------------------------------------------------------------------------

-- NOTE: RLS policies must be enabled and defined in Supabase for security.
-- Example RLS policy for organizations table:
-- CREATE POLICY "Enable read access for all users in the organization" ON "public"."organizations"
-- AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() IN (SELECT user_id FROM users WHERE organization_id = organizations.id));