# TalentPulse AI - Project Structure Explained

This document provides a detailed breakdown of the final project structure, explaining the purpose of each directory and key file.

## 1. Top-Level Directory

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `database/` | Contains the final, consolidated SQL schema for your Supabase instance. **Crucial for initial setup.** | `schema.sql` |
| `docs/` | All comprehensive project documentation, guides, and architectural decisions. | `DEVELOPMENT_CHECKLIST_AND_ROADMAP.md`, `GUIDANCE_MANUAL_REVIEW.md`, `PROJECT_BUSINESS_DOCUMENT.md`, `PROJECT_STRUCTURE_EXPLAINED.md` |
| `src/` | The main application source code (Next.js App Router). | `middleware.ts` |
| `.env.example` | Template for environment variables. | |
| `package.json` | Project dependencies and scripts. | |
| `README.md` | Project overview and quick start guide. | |

## 2. Source (`src/`) Directory

### `src/app` (Routing and Pages)

This directory follows the Next.js App Router convention, organizing files by route segments.

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `src/app/(auth)/` | Group for all authentication-related pages. | `signup/page.tsx` (Core signup UI) |
| `src/app/api/public/` | **Public-facing API endpoints.** Used for unauthenticated actions like the candidate submission form. | `submit/[slug]/route.ts` (Handles resume upload and submission) |
| `src/app/public/` | **Public-facing pages.** Used for unauthenticated pages like the candidate submission form. | `submit/[slug]/page.tsx` (Candidate submission form UI) |
| `src/app/reviews/` | The Manual Review Workflow dashboard. | `page.tsx` (Main review queue UI) |
| `src/app/users/` | User and Role Management interface. | `page.tsx` (User list and management UI) |
| `src/app/settings/ai/` | AI configuration page. | `page.tsx` (UI for setting models, budgets, and thresholds) |
| `src/middleware.ts` | **Security and Authentication Middleware.** Protects routes and handles session management. | |

### `src/lib` (Core Libraries and Logic)

This directory contains all the reusable, non-UI business logic.

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `src/lib/auth/` | **Authentication and RBAC logic.** | `auth-helpers.ts` (Login/logout, token handling), `permissions.ts` (Role-to-permission mapping) |
| `src/lib/db/` | **Stabilized Database Operations.** Contains the core CRUD functions for the main entities. | `jobs.ts`, `candidates.ts`, `clients.ts` |
| `src/lib/supabase/` | Supabase client initialization utilities. **Critical fix for local dev.** | `server.ts` (Server-side Supabase client) |
| `src/lib/audit/` | **Activity Tracking and Logging.** | `activity-logger.ts` (Utility to write to the `activities` table) |
| `src/lib/errors/` | Centralized error handling utilities. | `error-handler.ts` |
| `src/lib/middleware/` | Server-side middleware logic (e.g., rate limiting). | `rate-limiter.ts` |
| `src/lib/types.ts` | Shared TypeScript types for the entire application. | |

### `src/components` (Reusable UI Components)

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `src/components/ui/` | Low-level, unstyled or lightly-styled UI primitives (e.g., Button, Input, Card). | `Button.tsx`, `Input.tsx` |
| `src/components/auth/` | Reusable authentication forms and wrappers. | `LoginForm.tsx`, `ProtectedRoute.tsx` |
| `src/components/layout/` | Application shell, navigation, and common layout elements. | `Sidebar.tsx`, `Header.tsx` |
| `src/components/jobs/` | Job-specific UI components. | `JobCard.tsx` |
