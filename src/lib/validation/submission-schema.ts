// ============================================================================
// Submission Validation Schema
// Path: lib/validation/submission-schema.ts
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Submission Status Enum
// ============================================================================

export const submissionStatusEnum = z.enum([
  'new',
  'pre_screening',
  'internal_review',
  'submitted_to_client',
  'client_review',
  'interview_scheduled',
  'interviewed',
  'offer_extended',
  'offer_accepted',
  'hired',
  'rejected'
]);

export type SubmissionStatus = z.infer<typeof submissionStatusEnum>;

// ============================================================================
// Submission Schema
// ============================================================================

export const submissionSchema = z.object({
  // Required Fields
  job_id: z.string()
    .uuid('Must be a valid job ID'),
  
  candidate_id: z.string()
    .uuid('Must be a valid candidate ID'),
  
  organization_id: z.string()
    .uuid('Must be a valid organization ID'),
  
  submitted_by: z.string()
    .uuid('Must be a valid user ID'),
  
  // Status
  status: submissionStatusEnum
    .default('new'),
  
  // Details
  submitted_at: z.string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  
  resume_version_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  cover_letter: z.string()
    .max(5000, 'Cover letter must be less than 5000 characters')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
  
  // Rates & Contract
  proposed_bill_rate: z.number()
    .positive('Bill rate must be positive')
    .optional()
    .nullable(),
  
  proposed_pay_rate: z.number()
    .positive('Pay rate must be positive')
    .optional()
    .nullable(),
  
  currency: z.string()
    .default('EUR'),
  
  contract_duration_months: z.number()
    .int()
    .positive('Duration must be positive')
    .max(60, 'Duration cannot exceed 60 months')
    .optional()
    .nullable(),
  
  start_date: z.string()
    .optional()
    .nullable(),
  
  // Client Feedback
  client_feedback: z.string()
    .optional()
    .nullable(),
  
  rejection_reason: z.string()
    .optional()
    .nullable(),
  
  interview_feedback: z.array(z.object({
    interviewer: z.string(),
    date: z.string(),
    feedback: z.string(),
    rating: z.number().min(1).max(5).optional(),
  }))
    .optional()
    .nullable(),
})
.refine((data) => {
  // If bill rate and pay rate are both provided, bill rate must be higher
  if (data.proposed_bill_rate && data.proposed_pay_rate) {
    return data.proposed_bill_rate > data.proposed_pay_rate;
  }
  return true;
}, {
  message: 'Bill rate must be higher than pay rate',
  path: ['proposed_bill_rate'],
});

// ============================================================================
// Type Inference
// ============================================================================

export type SubmissionFormData = z.infer<typeof submissionSchema>;

// ============================================================================
// Update Schema (partial)
// ============================================================================

export const submissionUpdateSchema = submissionSchema.partial();

// ============================================================================
// Status Change Schema
// ============================================================================

export const submissionStatusChangeSchema = z.object({
  status: submissionStatusEnum,
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  changed_by: z.string().uuid(),
});

export type SubmissionStatusChangeData = z.infer<typeof submissionStatusChangeSchema>;

// ============================================================================
// Quick Submission Schema
// ============================================================================

export const quickSubmissionSchema = z.object({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  submitted_by: z.string().uuid(),
  notes: z.string().optional(),
});

export type QuickSubmissionData = z.infer<typeof quickSubmissionSchema>;

// ============================================================================
// Bulk Status Update Schema
// ============================================================================

export const bulkStatusUpdateSchema = z.object({
  submission_ids: z.array(z.string().uuid())
    .min(1, 'At least one submission ID is required')
    .max(50, 'Cannot update more than 50 submissions at once'),
  status: submissionStatusEnum,
  changed_by: z.string().uuid(),
});

export type BulkStatusUpdateData = z.infer<typeof bulkStatusUpdateSchema>;