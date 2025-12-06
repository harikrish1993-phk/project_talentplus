# TalentPulse AI - Business and Product Overview

## 1. Tool Name and Vision

| Detail | Description |
| :--- | :--- |
| **Tool Name** | **TalentPulse AI** |
| **Tagline** | The Human-in-the-Loop Recruitment Platform |
| **Vision** | To empower recruitment teams with AI-driven speed and human-validated accuracy, creating a proprietary, self-improving talent acquisition engine. |
| **Target Audience** | Mid-to-Large Enterprise Recruitment Teams and Specialized Staffing Agencies. |

## 2. Core Value Proposition

TalentPulse AI is not just an Applicant Tracking System (ATS); it is a **Talent Intelligence Platform**. Its core value lies in its **Human-in-the-Loop (HITL) architecture**, which ensures that every human correction directly trains the AI, leading to a proprietary, competitive advantage in talent matching that improves over time.

## 3. Business-Level Labeling and Terminology

All labels and text are designed to be professional, user-friendly, and industry-standard.

| Development Term (Old) | Business Term (New) | Purpose |
| :--- | :--- | :--- |
| `owner` | **Administrator** / **Account Manager** | Clear role for system oversight and billing. |
| `client` | **Client Account** | Represents the company the job is for. |
| `job` | **Job Posting** / **Position** | The open role being recruited for. |
| `submission` | **Candidate Application** | A candidate's formal application to a specific job. |
| `library` | **Candidate Library** | The central repository of all candidate profiles. |
| `match` | **Talent Match** | The AI-driven process of scoring a candidate against a job. |
| `activity_tracking` | **Audit Trail** / **Activity Log** | Immutable record of all user actions for compliance and review. |

## 4. Key Modules and Functionality

| Module | Purpose | Key Features |
| :--- | :--- | :--- |
| **Job Management** | Create, track, and manage all open positions. | Job Posting creation, Pipeline Stage customization, Recruiter assignment. |
| **Client Management** | Manage client relationships and associated jobs. | Client contact details, Job history, Account Manager assignment. |
| **Candidate Library** | Centralized, AI-parsed repository of talent. | Bulk resume import, Profile editing, Talent Match history, **Source Tracking**. |
| **Talent Match** | AI-driven candidate scoring. | LLM-based matching, Match Rationale, **Manual Review Workflow (HITL)**. |
| **Submissions** | Manage candidates in the hiring pipeline. | Status tracking (Applied, Interview, Offered), Recruiter Notes, Rejection reasons. |
| **User Management** | Control team access and permissions. | Role-Based Access Control (RBAC), User invitation, **Administrator** role. |
| **Data Ingestion** | Multiple ways to get candidates into the system. | **Public Candidate Submission Form**, Bulk Resume Upload, LinkedIn Extension (Planned). |

## 5. Subscription Model Overview

The subscription model is designed to align value with usage and feature access.

| Tier | Target User | Key Features | AI Usage |
| :--- | :--- | :--- | :--- |
| **Starter** | Small Teams / Pilot | Core Job/Client/Candidate Management, Basic Talent Match, **Limited Manual Review**. | Pay-as-you-go AI parsing. |
| **Professional** | Mid-Sized Teams | All Starter features, **Unlimited Manual Review**, Full User Management, **Public Submission Form**. | Monthly AI budget included, discounted overage. |
| **Enterprise** | Large Organizations | All Professional features, **Custom RBAC**, API Access, **Dedicated Support**, **LinkedIn Extension**. | High monthly AI budget, dedicated LLM model access. |

## 6. New Feature Design: Public Candidate Submission Form

### Requirement
Provide a simple, professional way for candidates to apply directly to a job posting shared on public platforms (e.g., LinkedIn, company career page).

### Implementation
1.  **Public Job Link Generation:** Recruiters generate a unique, short URL (slug) for any active Job Posting. This slug is stored in the `public_job_links` table.
2.  **Candidate Experience:** The candidate clicks the link and is taken to a clean, branded form (`/public/submit/[slug]`).
3.  **Data Capture:** The form collects Name, Email, Phone, and a Resume file (PDF/DOCX). It requires explicit consent for data storage.
4.  **Backend Process:**
    *   The submission API validates the slug and uploads the resume to Supabase Storage.
    *   A record is created in the `public_submissions` table.
    *   A background process is triggered to parse the resume and create a new `candidate` record with `source: 'web_form'`.
    *   The recruiter is notified of the new application.

## 7. New Feature Design: LinkedIn Web Extension

### Requirement
Allow recruiters to quickly import a candidate's profile from LinkedIn into the Candidate Library.

### Implementation
*   **Architecture:** Follows the design detailed in `docs/linkedin_extension_architecture.md`.
*   **Security:** Uses a secure, scoped API Key for authentication.
*   **Process:** User clicks a button on the LinkedIn profile page. The extension extracts visible data and sends it to the TalentPulse API (`/api/import/linkedin`). The backend handles the candidate creation and parsing asynchronously.
