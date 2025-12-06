# TalentPulse AI - The Human-in-the-Loop Recruitment Platform

## Project Overview

**TalentPulse AI** is a next-generation Applicant Tracking System (ATS) designed to combine the speed and scale of Artificial Intelligence with the critical judgment of human recruiters. It features a unique **Human-in-the-Loop (HITL) Manual Review Workflow** that continuously trains and improves the core AI matching engine, giving your organization a proprietary, competitive advantage in talent acquisition.

This repository contains the complete, stabilized core of the TalentPulse AI platform, built with a modern tech stack and best practices.

## Key Features Implemented (Critical Path)

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Local Development** | ✅ **Stable** | Critical dependency and module resolution errors fixed. |
| **Database Schema** | ✅ **Finalized** | Consolidated, multi-tenant schema with 20+ tables (see `database/schema.sql`). |
| **Authentication** | ✅ **Core Logic** | Secure signup, middleware, and session management implemented. |
| **Role-Based Access Control (RBAC)** | ✅ **Core Logic** | Permissions system implemented for Administrator, Team Lead, Recruiter, and Viewer roles. |
| **Core Management** | ✅ **Stabilized** | Robust CRUD operations for Jobs, Clients, and Candidates with multi-tenancy and audit logging. |
| **Manual Review Workflow** | ✅ **Core Logic** | Database and UI components for human-in-the-loop AI training. |
| **Public Submission Form** | ✅ **Implemented** | Full UI and API for candidates to apply directly via a public link. |
| **Activity Tracking** | ✅ **Implemented** | System-wide logging of user actions for audit and compliance. |

## Project Structure and Purpose

The project is built on the Next.js App Router with TypeScript and Supabase for a modern, scalable full-stack architecture.

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `database/` | Contains the final, consolidated SQL schema for your Supabase instance. | `schema.sql` |
| `src/app/(auth)/` | Authentication pages (Login, Signup, etc.). | `signup/page.tsx` |
| `src/app/api/public/` | Public-facing API endpoints (no authentication required). | `submit/[slug]/route.ts` |
| `src/app/public/` | Public-facing pages (e.g., the candidate submission form). | `submit/[slug]/page.tsx` |
| `src/lib/auth/` | Authentication and RBAC logic. | `auth-helpers.ts`, `permissions.ts` |
| `src/lib/db/` | Stabilized core database interaction logic. | `jobs.ts`, `candidates.ts`, `clients.ts` |
| `src/lib/supabase/` | Supabase client initialization. | `server.ts` (Fixed) |
| `src/lib/audit/` | Activity logging and audit trail utilities. | `activity-logger.ts` |
| `docs/` | Comprehensive project documentation and guides. | `DEVELOPMENT_CHECKLIST_AND_ROADMAP.md` |

## Quick Start Guide

### 1. Prerequisites

*   Node.js (v18+)
*   pnpm (Recommended package manager)
*   A Supabase project (or PostgreSQL database)

### 2. Setup

1.  **Clone the Repository:**
    ```bash
    # Assuming you are integrating the provided files into your existing project
    # If starting fresh, copy the contents of the delivered archive.
    ```

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure Environment:**
    Copy the provided `.env.example` to `.env.local` and fill in your Supabase credentials.
    ```bash
    cp .env.example .env.local
    ```

4.  **Database Migration:**
    Apply the final schema to your Supabase project.
    ```sql
    -- Execute the contents of database/schema.sql in your Supabase SQL Editor
    ```

5.  **Run Development Server:**
    ```bash
    pnpm dev
    ```