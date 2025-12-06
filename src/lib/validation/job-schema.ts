// ============================================================================
// Job Validation Schema
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Job Schema for Creation/Update
// ============================================================================

export const jobSchema = z.object({
  // Basic Info
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(100, 'Description must be at least 100 characters'),
  
  client_id: z.string()
    .uuid('Invalid client ID'),
  
  // Location
  location: z.string()
    .min(2, 'Location is required')
    .optional(),
  
  location_type: z.enum(['onsite', 'remote', 'hybrid'])
    .optional(),
  
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  
  // Skills & Requirements
  skills_required: z.array(z.string())
    .min(1, 'At least one skill is required'),
  
  skills_preferred: z.array(z.string())
    .default([]),
  
  certifications_required: z.array(z.string())
    .default([]),
  
  languages_required: z.array(z.string())
    .default([]),
  
  // Experience
  experience_min: z.number()
    .int()
    .min(0)
    .max(50)
    .optional(),
  
  experience_max: z.number()
    .int()
    .min(0)
    .max(50)
    .optional(),
  
  education_required: z.string().optional(),
  
  // Contract Details (for consultancy)
  duration_months: z.number()
    .int()
    .min(1, 'Duration must be at least 1 month')
    .max(60, 'Duration must be less than 60 months')
    .optional(),
  
  // Rates
  bill_rate: z.number()
    .positive('Bill rate must be positive')
    .optional(),
  
  pay_rate: z.number()
    .positive('Pay rate must be positive')
    .optional(),
  
  salary_currency: z.string()
    .length(3, 'Currency must be 3 letters (e.g., EUR, USD)')
    .default('EUR'),
  
  // Requirements
  requires_eu_nationality: z.boolean()
    .default(false),
  
  requires_work_permit: z.boolean()
    .default(false),
  
  requires_security_clearance: z.boolean()
    .default(false),
  
  // Status
  job_status: z.enum(['draft', 'open', 'closed', 'on_hold', 'cancelled'])
    .default('draft'),
  
  // Optional fields
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  positions_available: z.number().int().min(1).default(1),
  
}).refine(
  (data) => {
    // If both experience fields are provided, max must be >= min
    if (data.experience_max !== undefined && data.experience_min !== undefined) {
      return data.experience_max >= data.experience_min;
    }
    return true;
  },
  {
    message: 'Maximum experience must be greater than or equal to minimum experience',
    path: ['experience_max'],
  }
).refine(
  (data) => {
    // If both rates are provided, bill rate must be > pay rate
    if (data.bill_rate !== undefined && data.pay_rate !== undefined) {
      return data.bill_rate > data.pay_rate;
    }
    return true;
  },
  {
    message: 'Bill rate must be greater than pay rate',
    path: ['bill_rate'],
  }
);

// ============================================================================
// Type Inference
// ============================================================================

export type JobFormData = z.infer<typeof jobSchema>;

// ============================================================================
// Partial Schema for Updates
// ============================================================================

// Create the base update schema by making the original schema optional
export const jobUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  client_id: z.string().uuid().optional(),
  location: z.string().max(200).optional(),
  location_type: z.enum(['on-site', 'hybrid', 'remote']).optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'temporary']).optional(),
  skills_required: z.array(z.string()).optional(),
  experience_required: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  nice_to_have: z.array(z.string()).optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_currency: z.string().optional(),
  eu_nationality_required: z.boolean().optional(),
  job_status: z.enum(['draft', 'open', 'on_hold', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  hiring_manager_name: z.string().optional(),
  hiring_manager_email: z.string().email().optional(),
  hiring_manager_phone: z.string().optional(),
  positions_available: z.number().optional(),
}).strict();

export type JobUpdateData = z.infer<typeof jobUpdateSchema>;

// ============================================================================
// Quick Job Schema (for AI-assisted creation)
// ============================================================================

export const quickJobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(100),
  client_id: z.string().uuid(),
});

export type QuickJobData = z.infer<typeof quickJobSchema>;