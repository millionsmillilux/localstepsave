export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string | null
          created_at: string
          credential_url: string | null
          description: string
          id: string
          organization: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          credential_url?: string | null
          description?: string
          id?: string
          organization?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          credential_url?: string | null
          description?: string
          id?: string
          organization?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          category: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          organization: string
          role: string
          start_date: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          organization?: string
          role?: string
          start_date?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          organization?: string
          role?: string
          start_date?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          item_id: string | null
          item_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          item_id?: string | null
          item_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          item_id?: string | null
          item_type?: string
        }
        Relationships: []
      }
      application_events: {
        Row: {
          application_id: string
          created_at: string
          event_type: string
          id: string
          label: string
        }
        Insert: {
          application_id: string
          created_at?: string
          event_type: string
          id?: string
          label: string
        }
        Update: {
          application_id?: string
          created_at?: string
          event_type?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          body: string
          created_at: string
          employer_id: string
          id: string
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          employer_id: string
          id?: string
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          employer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          employer_id: string | null
          id: string
          interview_date: string | null
          match_score_at_submission: number
          message: string
          opportunity_id: string
          profile_snapshot: Json
          question_answers: Json
          status: string
          student_id: string
          submitted_at: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          employer_id?: string | null
          id?: string
          interview_date?: string | null
          match_score_at_submission?: number
          message?: string
          opportunity_id: string
          profile_snapshot: Json
          question_answers?: Json
          status?: string
          student_id: string
          submitted_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          employer_id?: string | null
          id?: string
          interview_date?: string | null
          match_score_at_submission?: number
          message?: string
          opportunity_id?: string
          profile_snapshot?: Json
          question_answers?: Json
          status?: string
          student_id?: string
          submitted_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          account_status: string
          contact_email: string | null
          created_at: string
          description: string
          id: string
          industry: string | null
          location: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          slug: string
          social_links: Json
          updated_at: string
          verification_notes: string | null
          verification_reviewed_at: string | null
          verification_status: string
          verification_submitted_at: string | null
          website: string | null
        }
        Insert: {
          account_status?: string
          contact_email?: string | null
          created_at?: string
          description?: string
          id?: string
          industry?: string | null
          location?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          slug: string
          social_links?: Json
          updated_at?: string
          verification_notes?: string | null
          verification_reviewed_at?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string
          contact_email?: string | null
          created_at?: string
          description?: string
          id?: string
          industry?: string | null
          location?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string
          social_links?: Json
          updated_at?: string
          verification_notes?: string | null
          verification_reviewed_at?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          application_id: string | null
          category: string
          created_at: string
          description: string
          due_date: string
          id: string
          opportunity_id: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          category?: string
          created_at?: string
          description?: string
          due_date: string
          id?: string
          opportunity_id?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          category?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          opportunity_id?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      job_events: {
        Row: {
          created_at: string
          employer: string | null
          event_type: string
          id: string
          job_id: string
          job_title: string | null
        }
        Insert: {
          created_at?: string
          employer?: string | null
          event_type: string
          id?: string
          job_id: string
          job_title?: string | null
        }
        Update: {
          created_at?: string
          employer?: string | null
          event_type?: string
          id?: string
          job_id?: string
          job_title?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          item_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          item_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          item_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_questions: Json
          business_profile_id: string | null
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_social_links: Json
          created_at: string
          deadline: string | null
          description: string
          employer_name: string
          employment_type: string | null
          experience: string | null
          expires_at: string | null
          id: string
          location: string
          maximum_age: number | null
          minimum_age: number | null
          openings: number
          opportunity_type: string
          owner_id: string
          pay_max: number | null
          pay_min: number | null
          posted_at: string
          required_skills: string[]
          requires_resume: boolean
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          saves_count: number
          schedule: string | null
          status: string
          summary: string
          tags: string[]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          application_questions?: Json
          business_profile_id?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_social_links?: Json
          created_at?: string
          deadline?: string | null
          description?: string
          employer_name: string
          employment_type?: string | null
          experience?: string | null
          expires_at?: string | null
          id: string
          location?: string
          maximum_age?: number | null
          minimum_age?: number | null
          openings?: number
          opportunity_type?: string
          owner_id: string
          pay_max?: number | null
          pay_min?: number | null
          posted_at?: string
          required_skills?: string[]
          requires_resume?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          saves_count?: number
          schedule?: string | null
          status?: string
          summary?: string
          tags?: string[]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          application_questions?: Json
          business_profile_id?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_social_links?: Json
          created_at?: string
          deadline?: string | null
          description?: string
          employer_name?: string
          employment_type?: string | null
          experience?: string | null
          expires_at?: string | null
          id?: string
          location?: string
          maximum_age?: number | null
          minimum_age?: number | null
          openings?: number
          opportunity_type?: string
          owner_id?: string
          pay_max?: number | null
          pay_min?: number | null
          posted_at?: string
          required_skills?: string[]
          requires_resume?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          saves_count?: number
          schedule?: string | null
          status?: string
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_metrics: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          metric: string
          opportunity_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          metric: string
          opportunity_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          metric?: string
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_metrics_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          job_id: string
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          job_id: string
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          job_id?: string
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          profile: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          profile?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          profile?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_resumes: {
        Row: {
          resume: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          resume?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          resume?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string
          due_date: string | null
          id: string
          priority: string
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_status: string
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_submissions: {
        Row: {
          business_profile_id: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          business_profile_id: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          business_profile_id?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_submissions_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      employer_dashboard_counts: {
        Args: never
        Returns: {
          active_jobs: number
          applicants: number
          interviews: number
          offers: number
          pending_jobs: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      job_interest_summary: {
        Args: never
        Returns: {
          applications: number
          employer: string
          job_id: string
          job_title: string
          last_event_at: string
          views: number
        }[]
      }
      record_opportunity_metric: {
        Args: { p_metric: string; p_opportunity_id: string }
        Returns: undefined
      }
      submit_verification: { Args: { profile_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
