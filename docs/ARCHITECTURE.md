# TalentPulse AI - System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [AI/LLM Integration](#aillm-integration)
7. [Authentication & Authorization](#authentication--authorization)
8. [Multi-Tenancy Design](#multi-tenancy-design)
9. [Data Flow](#data-flow)
10. [Security Architecture](#security-architecture)
11. [Deployment Architecture](#deployment-architecture)

---

## Overview

TalentPulse AI is a comprehensive AI-powered Applicant Tracking System (ATS) designed for staffing agencies and recruitment firms. The platform leverages artificial intelligence to automate resume parsing, candidate matching, and recruitment workflows while providing a modern, intuitive user interface.

### Key Features
- AI-powered resume parsing using GPT-4 and Claude
- Intelligent candidate-job matching with scoring algorithms
- Multi-tenant SaaS architecture with organization isolation
- Role-based access control (Business Owner, Admin, Team Lead, Recruiter, Viewer)
- Comprehensive candidate and job management
- External candidate search (LinkedIn integration)
- Analytics and reporting dashboards
- Activity tracking and audit trails

### Design Principles
- **Multi-tenant by design**: Complete data isolation between organizations
- **AI-first approach**: Leverage LLMs for parsing, matching, and analysis
- **Scalability**: Built to handle thousands of candidates and jobs
- **Security**: Row-level security, role-based access, audit logging
- **Flexibility**: Configurable AI providers, fallback strategies, extensible architecture

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **UI Library**: React 18
- **Styling**: TailwindCSS 3.4
- **State Management**: Zustand 4.4
- **Data Fetching**: TanStack React Query 5.17
- **Forms**: React Hook Form 7.49
- **Validation**: Zod 3.22
- **Icons**: Lucide React
- **Charts**: Recharts 2.10
- **Animations**: Framer Motion 11.0

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Supabase Client SDK
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **File Parsing**: pdf-parse, mammoth (DOCX)

### AI/LLM
- **Primary Provider**: OpenAI (GPT-4 Turbo, GPT-3.5 Turbo)
- **Secondary Provider**: Anthropic (Claude 3.5 Sonnet)
- **Fallback**: Pattern-based extraction (regex)
- **Use Cases**: Resume parsing, job analysis, candidate matching

### External Services
- **Email**: SMTP / Resend / SendGrid
- **LinkedIn Data**: RapidAPI LinkedIn Data API
- **Monitoring**: Sentry (configured, not implemented)
- **Analytics**: Google Analytics / PostHog (configured, not implemented)

### Development Tools
- **Package Manager**: npm / pnpm
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Testing**: Jest (configured, no tests written)
- **Git Hooks**: Husky + lint-staged
- **Type Checking**: TypeScript compiler

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   API Client │      │
│  │  (Next.js)   │  │  (Future)    │  │  (Webhooks)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Application Layer                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js Application                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Pages   │  │    API   │  │  Server  │          │    │
│  │  │  (SSR)   │  │  Routes  │  │  Actions │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Business Logic Layer                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │   Auth   │  │   Jobs   │  │Candidates│          │    │
│  │  │  Service │  │  Service │  │  Service │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Match   │  │  Parse   │  │  Report  │          │    │
│  │  │  Service │  │  Service │  │  Service │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                   Integration Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  OpenAI  │  │Anthropic │  │ LinkedIn │  │   SMTP   │     │
│  │   API    │  │   API    │  │   API    │  │  Server  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                      Data Layer                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Supabase Platform                       │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │     │
│  │  │PostgreSQL│  │   Auth   │  │  Storage │          │     │
│  │  │ Database │  │  Service │  │  Bucket  │          │     │
│  │  └──────────┘  └──────────┘  └──────────┘          │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a modular architecture with clear separation of concerns:

**Presentation Layer** (`src/app`, `src/components`)
- Page components (Next.js App Router)
- Reusable UI components
- Layout components (Header, Sidebar)
- Feature-specific components (Jobs, Candidates, etc.)

**Business Logic Layer** (`src/lib`)
- Database access functions (`src/lib/db`)
- AI services (`src/lib/ai`)
- Utility functions (`src/lib/utils`)
- Custom hooks (`src/lib/hooks`)
- Type definitions (`src/lib/types`)

**API Layer** (`src/app/api`)
- RESTful API routes
- Request validation
- Error handling
- Response formatting

**Data Layer** (`database`)
- SQL schema definitions
- Row-level security policies
- Database migrations
- Seed data

---

## Database Architecture

### Entity-Relationship Overview

The database follows a multi-tenant design with organization-level isolation. All major entities are scoped to an organization.

### Core Entities

**Organizations** (Multi-tenant root)
- Represents a staffing agency or recruitment firm
- Contains subscription and billing information
- Defines usage limits and feature flags

**Users** (Authentication & Authorization)
- Belongs to one organization
- Has a role (owner, admin, team_lead, recruiter, viewer)
- Stores permissions and preferences

**Clients** (Customer Companies)
- Companies that hire through the staffing agency
- Has account manager assignment
- Tracks contract and billing information

**Jobs** (Open Positions)
- Belongs to a client
- Contains job requirements and description
- Assigned to recruiters
- Has AI matching settings

**Candidates** (Talent Pool)
- Parsed from resumes using AI
- Contains skills, experience, education
- Has authenticity and fraud detection scores
- Tracks source and referrals

**Applications** (Candidate-Job Relationships)
- Links candidates to jobs
- Stores match scores and explanations
- Tracks application status and stage
- Contains recruiter notes

**Parse Attempts** (AI Audit Log)
- Logs all AI parsing attempts
- Tracks tokens used and costs
- Stores confidence and success rate

**Candidate Matches** (Saved Matches)
- Pre-computed match scores
- Detailed skill matching breakdown
- Shortlist and rejection tracking

**Activities** (Audit Trail)
- Tracks all user actions
- Immutable log for compliance
- Searchable and filterable

**Notifications** (User Notifications)
- In-app and email notifications
- Read/unread status
- Action links

### Database Schema Diagram

```
┌─────────────────┐
│ organizations   │
│─────────────────│
│ id (PK)         │
│ name            │
│ subscription    │
│ max_users       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────────────────────────┐
    │                                          │
┌───┴──────────┐                      ┌───────┴─────┐
│    users     │                      │   clients   │
│──────────────│                      │─────────────│
│ id (PK)      │                      │ id (PK)     │
│ org_id (FK)  │                      │ org_id (FK) │
│ role         │                      │ company     │
│ permissions  │                      └──────┬──────┘
└──────┬───────┘                             │
       │                                     │ 1:N
       │                                     │
       │                              ┌──────┴──────┐
       │                              │    jobs     │
       │                              │─────────────│
       │                              │ id (PK)     │
       │                              │ org_id (FK) │
       │                              │ client_id   │
       │                              │ title       │
       │                              │ skills_req  │
       │                              └──────┬──────┘
       │                                     │
       │                                     │ N:M
       │                                     │
       │                              ┌──────┴──────────┐
       │                              │  applications   │
       │                              │─────────────────│
       │                              │ id (PK)         │
       │                              │ candidate_id    │
       │                              │ job_id          │
       │                              │ match_score     │
       │                              └──────┬──────────┘
       │                                     │
       │ 1:N                                 │ N:1
       │                                     │
┌──────┴───────────┐                  ┌─────┴──────────┐
│   activities     │                  │   candidates   │
│──────────────────│                  │────────────────│
│ id (PK)          │                  │ id (PK)        │
│ org_id (FK)      │                  │ org_id (FK)    │
│ user_id (FK)     │                  │ name           │
│ action           │                  │ skills         │
│ entity_type      │                  │ parsed_data    │
│ entity_id        │                  │ parse_conf     │
└──────────────────┘                  └────────────────┘
```

### Multi-Tenancy Implementation

**Organization Isolation:**
- Every table (except `organizations`) has an `organization_id` foreign key
- Row-Level Security (RLS) policies enforce organization boundaries
- Users can only access data within their organization
- Queries automatically filter by organization_id

**RLS Policy Example:**
```sql
CREATE POLICY "Users can only see their org's candidates"
ON candidates FOR SELECT
USING (organization_id = auth.organization_id());
```

---

## API Architecture

### API Design Principles

The API follows RESTful conventions with Next.js API routes:

**Route Structure:**
```
/api/{resource}          → GET (list), POST (create)
/api/{resource}/[id]     → GET (read), PUT (update), DELETE (delete)
/api/{resource}/{action} → POST (custom action)
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  },
  "error": null
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token (missing)
- `POST /api/auth/signup` - User registration (missing)
- `POST /api/auth/forgot-password` - Password reset request (missing)
- `POST /api/auth/reset-password` - Password reset (missing)

#### Candidates
- `GET /api/candidates` - List candidates with filters
- `POST /api/candidates` - Create candidate
- `GET /api/candidates/[id]` - Get candidate details
- `PUT /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Delete candidate
- `POST /api/candidates/parse` - Parse resume
- `POST /api/candidates/match` - Match candidate to jobs
- `GET /api/candidates/export` - Export candidates
- `GET /api/candidates/insights` - Candidate insights

#### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job
- `POST /api/jobs/analyze` - Analyze job description with AI

#### Matching
- `POST /api/match` - Match candidates to job description
- `POST /api/match/find` - Find matches for specific job
- `GET /api/match/history` - Get matching history

#### Bulk Operations
- `POST /api/bulk` - Bulk upload resumes (up to 50 files)

#### External Search
- `POST /api/external-search` - Search external sources
- `POST /api/external-search/linkedin/search` - Search LinkedIn

#### Dashboard & Reports
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Activity feed
- `GET /api/dashboard/performance` - Performance metrics
- `GET /api/reports/performance` - Performance report
- `GET /api/reports/pipeline` - Pipeline report
- `GET /api/reports/placements` - Placements report
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/export` - Export report

#### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

#### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/[id]` - Get interview details
- `PUT /api/interviews/[id]` - Update interview
- `POST /api/interviews/feedback` - Submit interview feedback

#### Settings
- `GET /api/settings` - Get settings (missing)
- `PUT /api/settings` - Update settings (missing)

#### Webhooks
- `POST /api/webhook/ats` - ATS webhook endpoint

---

## AI/LLM Integration

### AI Architecture

The system uses a **provider-agnostic AI architecture** with fallback strategies:

**Provider Hierarchy:**
1. **Primary**: OpenAI (GPT-4 Turbo for parsing, GPT-3.5 Turbo for matching)
2. **Secondary**: Anthropic (Claude 3.5 Sonnet)
3. **Fallback**: Pattern-based extraction (regex)

### AI Use Cases

#### 1. Resume Parsing
**Goal**: Extract structured data from unstructured resume text

**Process:**
1. Extract text from PDF/DOCX using `pdf-parse` or `mammoth`
2. Send text to LLM with structured prompt
3. Request JSON response with specific schema
4. Validate and normalize extracted data
5. Calculate confidence score
6. Flag for manual review if confidence < 60%

**Models Used:**
- OpenAI: `gpt-4-turbo-preview` (primary)
- Anthropic: `claude-3-5-sonnet-20241022` (fallback)

**Prompt Structure:**
```
Extract candidate information from this resume:

[Resume Text]

Return JSON with:
- Personal info (name, email, phone, location)
- Skills (technical, soft, languages)
- Experience (jobs with dates, titles, companies)
- Education (degrees, institutions, dates)
- Certifications
```

**Output Schema:**
```typescript
{
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  skills: string[],
  technical_skills: string[],
  soft_skills: string[],
  work_experience: Array<{
    title: string,
    company: string,
    start_date: string,
    end_date: string,
    description: string
  }>,
  education: Array<{
    degree: string,
    institution: string,
    graduation_date: string
  }>,
  certifications: string[],
  total_experience_years: number
}
```

#### 2. Job Description Analysis
**Goal**: Extract requirements and structure from job descriptions

**Process:**
1. Analyze job description text
2. Extract required skills, preferred skills
3. Identify seniority level, employment type
4. Determine experience requirements
5. Extract location and remote work preferences

**Models Used:**
- OpenAI: `gpt-4-turbo-preview`

#### 3. Candidate-Job Matching
**Goal**: Score how well a candidate matches a job

**Approach**: Hybrid (AI + Algorithm)

**Algorithm-Based Matching** (Fast, Cost-Effective):
- Skills match: 40 points (required skills coverage)
- Experience match: 25 points (years of experience)
- Certifications match: 15 points
- Location match: 10 points
- Languages match: 10 points
- **Total**: 100 points

**AI-Based Matching** (Accurate, Expensive):
- Send candidate profile + job requirements to LLM
- Request detailed analysis and scoring
- Get match score, reasons, missing skills
- More nuanced understanding of fit

**When to Use:**
- Algorithm: Bulk matching (1000+ candidates)
- AI: Final shortlist (top 20 candidates)

### AI Configuration

**Current Configuration** (`src/lib/config.ts`):
```typescript
ai: {
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        parsing: 'gpt-4-turbo-preview',
        matching: 'gpt-3.5-turbo-0125'
      }
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: {
        fallback: 'claude-3-opus-20240229'
      }
    }
  },
  strategy: {
    resumeParsing: ['openai', 'anthropic', 'regex'],
    jobAnalysis: ['openai', 'regex'],
    matching: ['openai']
  }
}
```

**Missing**: UI to configure AI settings, token budgets, cost tracking

---

## Authentication & Authorization

### Authentication Flow

**Current Implementation** (Supabase Auth):
1. User enters email and password
2. Supabase Auth validates credentials
3. JWT token issued (access token + refresh token)
4. Token stored in browser (httpOnly cookie)
5. Token sent with every API request
6. Middleware validates token and extracts user

**Missing**:
- Sign-up flow
- Email verification
- Password reset
- 2FA
- OAuth (Google, GitHub)

### Authorization Model

**Role Hierarchy:**
```
Business Owner (owner)
  ↓
Administrator (admin)
  ↓
Team Lead (team_lead)
  ↓
Recruiter (recruiter)
  ↓
Viewer (viewer)
```

**Permissions by Role:**

| Feature | Viewer | Recruiter | Team Lead | Admin | Owner |
|---------|--------|-----------|-----------|-------|-------|
| View Jobs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Jobs | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Jobs | ❌ | Own | ✅ | ✅ | ✅ |
| Delete Jobs | ❌ | ❌ | Own | ✅ | ✅ |
| View Candidates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Candidates | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Candidates | ❌ | Own | ✅ | ✅ | ✅ |
| Delete Candidates | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Reports | ❌ | Own | Team | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Billing | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Settings | ❌ | ❌ | ❌ | ✅ | ✅ |

**Implementation:**
- Role stored in `users.role` column
- Permissions stored in `users.permissions` JSONB column
- Middleware checks role and permissions before allowing access
- RLS policies enforce database-level access control

---

## Multi-Tenancy Design

### Isolation Strategy

**Row-Level Isolation:**
- Every table has `organization_id` foreign key
- RLS policies automatically filter by organization
- No cross-organization data leakage
- Shared database, isolated data

**Benefits:**
- Cost-effective (single database)
- Easy to manage and backup
- Centralized monitoring
- Simple schema updates

**Drawbacks:**
- Potential performance impact at scale
- Risk of accidental data exposure
- Requires careful RLS policy management

### Organization Management

**Subscription Tiers:**
- **Trial**: 5 users, 50 jobs, 1000 candidates, 10GB storage
- **Starter**: 10 users, 200 jobs, 5000 candidates, 50GB storage
- **Professional**: 50 users, 1000 jobs, 25000 candidates, 250GB storage
- **Enterprise**: Unlimited users, jobs, candidates, storage

**Usage Limits Enforcement:**
- Checked at API level before creation
- Soft limits with warnings
- Hard limits prevent creation
- Upgrade prompts when limit reached

---

## Data Flow

### Resume Upload & Parsing Flow

```
User uploads resume
  ↓
[Frontend] File validation (type, size)
  ↓
[API] POST /api/parse
  ↓
[File Extractor] Extract text (PDF/DOCX → plain text)
  ↓
[AI Parser] Send to OpenAI/Claude
  ↓
[AI Provider] Returns structured JSON
  ↓
[Validator] Validate and normalize data
  ↓
[Database] Save to candidates table
  ↓
[Audit Log] Save to parse_attempts table
  ↓
[Response] Return candidate ID and confidence
  ↓
[Frontend] Show success, redirect to candidate page
```

### Candidate Matching Flow

```
User enters job description
  ↓
[Frontend] Validate (min 100 chars)
  ↓
[API] POST /api/match
  ↓
[Job Analyzer] Extract requirements with AI
  ↓
[Database] Fetch candidates (limit 1000)
  ↓
[Matcher] Score each candidate (algorithm or AI)
  ↓
[Ranker] Sort by score, filter by threshold
  ↓
[Database] Save to candidate_matches table
  ↓
[History] Save to match_history (localStorage + DB)
  ↓
[Response] Return top matches with scores
  ↓
[Frontend] Display ranked candidates with explanations
```

---

## Security Architecture

### Security Layers

**1. Network Security**
- HTTPS only (enforced in production)
- CORS configuration (whitelist origins)
- Rate limiting (configured, not implemented)

**2. Authentication Security**
- JWT tokens (httpOnly cookies)
- Token expiration (7 days access, 30 days refresh)
- Secure password hashing (bcrypt via Supabase)
- Password requirements (min 8 chars, complexity)

**3. Authorization Security**
- Role-based access control (RBAC)
- Row-level security (RLS) policies
- Permission checks at API and DB level

**4. Data Security**
- Encryption at rest (Supabase default)
- Encryption in transit (TLS 1.3)
- PII data protection
- GDPR compliance (partial)

**5. Application Security**
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- CSRF protection (configured, not implemented)

### Security Gaps

**Critical:**
- No rate limiting active
- No CSRF protection implemented
- No input sanitization
- No security headers

**High:**
- No 2FA
- No session management
- No account lockout
- No audit logging for security events

---

## Deployment Architecture

### Recommended Deployment

**Platform**: Vercel (Next.js optimized)

**Architecture:**
```
[Vercel Edge Network]
  ↓
[Next.js Application] (Serverless Functions)
  ↓
[Supabase] (Database + Auth + Storage)
  ↓
[OpenAI API] / [Anthropic API]
```

**Environment Variables** (Production):
- All secrets in Vercel environment variables
- Separate environments: dev, staging, production
- No secrets in code or version control

**Scaling Strategy:**
- Serverless functions auto-scale
- Database connection pooling
- CDN for static assets
- Redis for caching (future)

### Alternative Deployment

**Platform**: AWS / Google Cloud / Azure

**Architecture:**
```
[Load Balancer]
  ↓
[Container Cluster] (ECS / GKE / AKS)
  ↓
[RDS PostgreSQL] (Managed Database)
  ↓
[S3 / GCS / Blob Storage] (File Storage)
```

**Benefits:**
- More control over infrastructure
- Better for enterprise customers
- Can run on-premise if needed

---

## Conclusion

TalentPulse AI has a **solid architectural foundation** with:
- Modern tech stack (Next.js, TypeScript, Supabase)
- Comprehensive database schema
- AI-first approach with fallback strategies
- Multi-tenant design with proper isolation
- RESTful API architecture

**However**, it requires significant work to be production-ready:
- Complete authentication and user management
- Implement security best practices
- Add missing features (settings, activity tracking, help)
- Write comprehensive tests
- Create documentation and deployment guides
- Fix terminology and improve UX

**Estimated Completion**: ~55% complete. Needs 2-3 months of focused development to reach production readiness.
