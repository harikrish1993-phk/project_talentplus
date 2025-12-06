// ============================================================================
// Interview Validation Schema
// Path: lib/validation/interview-schema.ts
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Interview Type Enum
// ============================================================================

export const interviewTypeEnum = z.enum([
  'phone_screening',
  'technical',
  'behavioral',
  'cultural_fit',
  'final_round',
  'panel',
  'other'
]);

export type InterviewType = z.infer<typeof interviewTypeEnum>;

// ============================================================================
// Interview Status Enum
// ============================================================================

export const interviewStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rescheduled',
  'no_show'
]);

export type InterviewStatus = z.infer<typeof interviewStatusEnum>;

// ============================================================================
// Interview Schema
// ============================================================================

export const interviewSchema = z.object({
  // Required Fields
  submission_id: z.string()
    .uuid('Must be a valid submission ID'),
  
  organization_id: z.string()
    .uuid('Must be a valid organization ID'),
  
  // Interview Details
  interview_type: interviewTypeEnum,
  
  status: interviewStatusEnum
    .default('scheduled'),
  
  // Schedule
  scheduled_date: z.string()
    .datetime('Must be a valid date'),
  
  duration_minutes: z.number()
    .int()
    .positive('Duration must be positive')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .default(60),
  
  // Location
  location: z.string()
    .optional()
    .nullable(),
  
  location_type: z.enum(['onsite', 'remote', 'phone'])
    .default('remote'),
  
  meeting_link: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  // Participants
  interviewer_name: z.string()
    .min(2, 'Interviewer name is required')
    .optional()
    .nullable(),
  
  interviewer_email: z.string()
    .email('Must be a valid email')
    .optional()
    .or(z.literal('')),
  
  interviewer_title: z.string()
    .optional()
    .nullable(),
  
  additional_interviewers: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
    title: z.string().optional(),
  }))
    .optional()
    .nullable(),
  
  // Notes
  preparation_notes: z.string()
    .max(2000, 'Preparation notes must be less than 2000 characters')
    .optional()
    .nullable(),
  
  internal_notes: z.string()
    .max(2000, 'Internal notes must be less than 2000 characters')
    .optional()
    .nullable(),
  
  // Feedback
  feedback: z.string()
    .max(5000, 'Feedback must be less than 5000 characters')
    .optional()
    .nullable(),
  
  rating: z.number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional()
    .nullable(),
  
  strengths: z.array(z.string())
    .optional()
    .nullable(),
  
  weaknesses: z.array(z.string())
    .optional()
    .nullable(),
  
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no'])
    .optional()
    .nullable(),
  
  // Logistics
  confirmation_sent: z.boolean()
    .default(false),
  
  reminder_sent: z.boolean()
    .default(false),
  
  cancelled_reason: z.string()
    .optional()
    .nullable(),
  
  rescheduled_from: z.string()
    .datetime()
    .optional()
    .nullable(),
  
  // Metadata
  created_by: z.string()
    .uuid('Must be a valid user ID'),
});

// ============================================================================
// Type Inference
// ============================================================================

export type InterviewFormData = z.infer<typeof interviewSchema>;

// ============================================================================
// Update Schema (partial)
// ============================================================================

export const interviewUpdateSchema = interviewSchema.partial();

// ============================================================================
// Feedback Schema
// ============================================================================

export const interviewFeedbackSchema = z.object({
  feedback: z.string()
    .min(50, 'Feedback must be at least 50 characters')
    .max(5000, 'Feedback must be less than 5000 characters'),
  
  rating: z.number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  
  strengths: z.array(z.string())
    .min(1, 'At least one strength is required'),
  
  weaknesses: z.array(z.string())
    .optional(),
  
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  
  status: z.literal('completed'),
});

export type InterviewFeedbackData = z.infer<typeof interviewFeedbackSchema>;

// ============================================================================
// Quick Schedule Schema
// ============================================================================

export const quickScheduleSchema = z.object({
  submission_id: z.string().uuid(),
  interview_type: interviewTypeEnum,
  scheduled_date: z.string().datetime(),
  duration_minutes: z.number().int().positive().default(60),
  location_type: z.enum(['onsite', 'remote', 'phone']).default('remote'),
  organization_id: z.string().uuid(),
  created_by: z.string().uuid(),
});

export type QuickScheduleData = z.infer<typeof quickScheduleSchema>;

// ============================================================================
// Reschedule Schema
// ============================================================================

export const rescheduleSchema = z.object({
  new_date: z.string().datetime(),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
});

export type RescheduleData = z.infer<typeof rescheduleSchema>;

// ============================================================================
// Cancel Schema
// ============================================================================

export const cancelSchema = z.object({
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
  notify_candidate: z.boolean().default(true),
  notify_interviewer: z.boolean().default(true),
});

export type CancelData = z.infer<typeof cancelSchema>;