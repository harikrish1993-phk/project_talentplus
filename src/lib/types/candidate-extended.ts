// Extended Candidate type with all properties used in the app
import { Candidate as BaseCandidate } from './index';

export interface ExtendedCandidate extends BaseCandidate {
  name?: string;
  title?: string;
  location?: string;
  parse_confidence?: number;
  parse_status?: string;
  parse_method?: string;
  authenticity_score?: number;
  years_of_experience?: number;
  has_eu_nationality?: boolean;
  full_name?: string;
}

// Re-export for backward compatibility
export type Candidate = ExtendedCandidate;
