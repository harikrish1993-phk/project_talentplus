// ============================================================================
// Client Validation Schema
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Client Schema
// ============================================================================

export const clientSchema = z.object({
  // Basic Info
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  
  industry: z.string()
    .min(2, 'Industry is required')
    .optional(),
  
  company_size: z.string()
    .optional(),
  
  website: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  // Contact Information
  primary_contact_name: z.string()
    .min(2, 'Contact name must be at least 2 characters')
    .optional(),
  
  primary_contact_email: z.string()
    .email('Must be a valid email')
    .optional()
    .or(z.literal('')),
  
  primary_contact_phone: z.string()
    .optional(),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  
  // Business Details
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  preferred_payment_method: z.string().optional(),
  
  // Relationship
  relationship_status: z.enum(['active', 'inactive', 'prospect', 'past'])
    .default('active'),
  
  // Notes
  notes: z.string().optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type ClientFormData = z.infer<typeof clientSchema>;

// ============================================================================
// Quick Client Schema (for modal/popup creation)
// ============================================================================

export const quickClientSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  primary_contact_email: z.string().email('Valid email required').optional(),
});

export type QuickClientData = z.infer<typeof quickClientSchema>;
