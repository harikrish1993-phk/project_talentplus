# LinkedIn Web Extension Integration Architecture

The goal of the LinkedIn Web Extension is to allow recruiters to quickly import candidate profiles directly from LinkedIn into the TalentPulse AI candidate library. This must be done securely and without violating LinkedIn's terms of service by relying on screen-scraping.

## 1. Core Principle: User-Initiated Data Transfer

The extension will not automatically scrape data. The process is initiated by the user (recruiter) and relies on the user's browser session to access the data.

## 2. Architecture Components

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **A. Web Extension** | JavaScript, HTML, CSS (Manifest V3) | Runs in the recruiter's browser to capture data and communicate with the TalentPulse API. |
| **B. TalentPulse API Endpoint** | Next.js API Route (`/api/import/linkedin`) | Securely receives the structured profile data from the extension. |
| **C. Supabase Storage** | Supabase Storage (S3) | Stores the profile data (e.g., as a JSON file or PDF snapshot) for audit and processing. |
| **D. Background Processing** | Serverless Function / Queue | Handles the heavy lifting of AI parsing and candidate creation asynchronously. |

## 3. Workflow: Profile Import

1.  **Recruiter Action:** The recruiter navigates to a candidate's LinkedIn profile and clicks the "Import to TalentPulse" button in the extension popup.
2.  **Data Extraction (Extension):** The extension uses content scripts to safely extract visible, structured data from the DOM (Name, Title, Experience, Education, etc.). **Crucially, it does not use unauthorized scraping techniques.**
3.  **Authentication (Extension):** The extension retrieves the recruiter's active TalentPulse API Key (stored securely in the extension's local storage after a one-time setup).
4.  **API Call (Extension to TalentPulse):** The extension sends a `POST` request to the dedicated API endpoint: `/api/import/linkedin`.
    *   **Payload:** Structured profile data, Recruiter's User ID, Organization ID, and the API Key.
5.  **API Validation (TalentPulse API):**
    *   Verifies the API Key against the `api_keys` table.
    *   Validates the payload structure.
    *   Checks the organization's usage limits.
6.  **Data Storage & Queue (TalentPulse Backend):**
    *   The raw profile data is saved to Supabase Storage (e.g., `linkedin_imports/raw/{id}.json`).
    *   A new record is created in the `candidates` table with `source: 'linkedin_extension'` and `status: 'pending_parse'`.
    *   A message is pushed to a background queue (e.g., a dedicated Supabase Edge Function or a separate service) to start the AI parsing process.
7.  **AI Processing (Background):** The background job reads the raw data, uses the LLM to parse and structure it, and updates the `candidates` record with the `ai_parsed_data` and `skills`.
8.  **Confirmation:** The API returns a success message to the extension, which then displays a confirmation to the recruiter.

## 4. Key Implementation Details

### Security & Compliance
*   **No Automated Scraping:** The process is strictly user-initiated and only extracts data visible to the user.
*   **API Key Security:** The extension should only store a non-revocable, scoped API key. The key should be hashed in the database.
*   **Rate Limiting:** The `/api/import/linkedin` endpoint must be heavily rate-limited per user and per organization to prevent abuse.

### Data Model Impact
*   The `candidates` table must be updated to handle the `linkedin_url` and `source: 'linkedin_extension'`. (Already included in the final schema).
*   The `activities` table will log the import action.

### Future Enhancement: Resume Generation
The extension could be enhanced to generate a clean, standardized resume PDF from the LinkedIn profile data before sending it to the TalentPulse API. This would allow the system to use the existing resume parsing workflow, treating the generated PDF as the primary input.