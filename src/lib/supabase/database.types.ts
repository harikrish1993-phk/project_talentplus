export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'recruiter' | 'hiring_manager'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'recruiter' | 'hiring_manager'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'recruiter' | 'hiring_manager'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          website: string | null
          contact_name: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          notes: string | null
          status: 'active' | 'inactive'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          industry?: string | null
          website?: string | null
          contact_name: string
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          notes?: string | null
          status?: 'active' | 'inactive'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          industry?: string | null
          website?: string | null
          contact_name?: string
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          notes?: string | null
          status?: 'active' | 'inactive'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string[]
          skills_required: string[]
          location: string
          employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          status: 'draft' | 'open' | 'closed' | 'on_hold'
          client_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          requirements?: string[]
          skills_required?: string[]
          location: string
          employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          status?: 'draft' | 'open' | 'closed' | 'on_hold'
          client_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          requirements?: string[]
          skills_required?: string[]
          location?: string
          employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          status?: 'draft' | 'open' | 'closed' | 'on_hold'
          client_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          location: string | null
          title: string | null
          summary: string | null
          skills: string[]
          years_of_experience: number | null
          experience: Json
          education: Json
          resume_url: string | null
          resume_text: string | null
          parse_confidence: number | null
          authenticity_score: number | null
          source: 'upload' | 'linkedin' | 'referral' | 'ats' | 'manual'
          status: 'active' | 'placed' | 'inactive' | 'do_not_contact'
          linkedin_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          location?: string | null
          title?: string | null
          summary?: string | null
          skills?: string[]
          years_of_experience?: number | null
          experience?: Json
          education?: Json
          resume_url?: string | null
          resume_text?: string | null
          parse_confidence?: number | null
          authenticity_score?: number | null
          source?: 'upload' | 'linkedin' | 'referral' | 'ats' | 'manual'
          status?: 'active' | 'placed' | 'inactive' | 'do_not_contact'
          linkedin_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          location?: string | null
          title?: string | null
          summary?: string | null
          skills?: string[]
          years_of_experience?: number | null
          experience?: Json
          education?: Json
          resume_url?: string | null
          resume_text?: string | null
          parse_confidence?: number | null
          authenticity_score?: number | null
          source?: 'upload' | 'linkedin' | 'referral' | 'ats' | 'manual'
          status?: 'active' | 'placed' | 'inactive' | 'do_not_contact'
          linkedin_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          match_score: number
          score_breakdown: Json
          matching_skills: string[]
          missing_skills: string[]
          ai_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          match_score: number
          score_breakdown?: Json
          matching_skills?: string[]
          missing_skills?: string[]
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          candidate_id?: string
          match_score?: number
          score_breakdown?: Json
          matching_skills?: string[]
          missing_skills?: string[]
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          status: 'submitted' | 'client_reviewing' | 'interview_scheduled' | 'interview_completed' | 'offer_extended' | 'offer_accepted' | 'offer_rejected' | 'rejected' | 'withdrawn'
          match_score: number | null
          notes: string | null
          timeline: Json
          submitted_by: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          status?: 'submitted' | 'client_reviewing' | 'interview_scheduled' | 'interview_completed' | 'offer_extended' | 'offer_accepted' | 'offer_rejected' | 'rejected' | 'withdrawn'
          match_score?: number | null
          notes?: string | null
          timeline?: Json
          submitted_by: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          candidate_id?: string
          status?: 'submitted' | 'client_reviewing' | 'interview_scheduled' | 'interview_completed' | 'offer_extended' | 'offer_accepted' | 'offer_rejected' | 'rejected' | 'withdrawn'
          match_score?: number | null
          notes?: string | null
          timeline?: Json
          submitted_by?: string
          submitted_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
