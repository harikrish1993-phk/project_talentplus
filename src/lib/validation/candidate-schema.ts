// src/lib/validation/candidate-schema.ts
import * as z from 'zod';

export const candidateSchema = z.object({
  full_name: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  current_title: z.string().optional(),
  current_company: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
  skills: z.array(z.string()).optional(),
  resume_text: z.string().optional(),
  resume_url: z.string().url().optional(),
  ai_parsed_data: z.any().optional(),
  source: z.string().optional(),
  organization_id: z.string().uuid(),
});

export type CandidateSchema = z.infer<typeof candidateSchema>;