export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StateCode = "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          agency_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          state: StateCode | null;
          suburbs: string[] | null;
          specializations: string[] | null;
          years_experience: number | null;
          properties_purchased: number | null;
          avg_rating: number | null;
          review_count: number | null;
          is_verified: boolean;
          is_active: boolean;
          licence_number: string | null;
          licence_verified_at: string | null;
          website_url: string | null;
          linkedin_url: string | null;
          fee_structure: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          agency_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          state?: StateCode | null;
          suburbs?: string[] | null;
          specializations?: string[] | null;
          years_experience?: number | null;
          properties_purchased?: number | null;
          avg_rating?: number | null;
          review_count?: number | null;
          is_verified?: boolean;
          is_active?: boolean;
          licence_number?: string | null;
          licence_verified_at?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          fee_structure?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          created_at: string;
          agent_id: string;
          buyer_name: string | null;
          rating: number;
          comment: string | null;
          property_suburb: string | null;
          property_type: string | null;
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          agent_id: string;
          buyer_name?: string | null;
          rating: number;
          comment?: string | null;
          property_suburb?: string | null;
          property_type?: string | null;
          is_approved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reviews_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      enquiries: {
        Row: {
          id: string;
          created_at: string;
          agent_id: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string | null;
          budget_min: number | null;
          budget_max: number | null;
          target_suburbs: string[] | null;
          property_type: string | null;
          message: string | null;
          status: "new" | "viewed" | "responded" | "closed" | null;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          agent_id: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          target_suburbs?: string[] | null;
          property_type?: string | null;
          message?: string | null;
          status?: "new" | "viewed" | "responded" | "closed" | null;
          is_read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enquiries_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      saved_agents: {
        Row: {
          id: string;
          created_at: string;
          buyer_id: string;
          agent_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          buyer_id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_agents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "saved_agents_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      agent_profiles: {
        Row: {
          id: string;
          agent_id: string | null;
          subscription_plan: "starter" | "verified-partner" | "enterprise";
          billing_cycle: "monthly" | "annual";
          subscription_status: "active" | "past_due" | "cancelled";
          next_billing_at: string | null;
          card_brand: string | null;
          card_last4: string | null;
          cancel_at_period_end: boolean;
          preferences: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          agent_id?: string | null;
          subscription_plan?: "starter" | "verified-partner" | "enterprise";
          billing_cycle?: "monthly" | "annual";
          subscription_status?: "active" | "past_due" | "cancelled";
          next_billing_at?: string | null;
          card_brand?: string | null;
          card_last4?: string | null;
          cancel_at_period_end?: boolean;
          preferences?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "agent_profiles_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: true;
          }
        ];
      };
      contact_submissions: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          email: string | null;
          subject: string | null;
          message: string | null;
          is_resolved: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          email?: string | null;
          subject?: string | null;
          message?: string | null;
          is_resolved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          title: string | null;
          slug: string | null;
          excerpt: string | null;
          content: string | null;
          category: string | null;
          author: string | null;
          published_at: string | null;
          is_published: boolean;
          cover_image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title?: string | null;
          slug?: string | null;
          excerpt?: string | null;
          content?: string | null;
          category?: string | null;
          author?: string | null;
          published_at?: string | null;
          is_published?: boolean;
          cover_image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      admin_accounts: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          preferences: Json;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          preferences?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["admin_accounts"]["Insert"]>;
        Relationships: [];
      };
      agency_review_sources: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          agent_id: string;
          source: "google_places" | "trustpilot" | "rate_my_agent" | "facebook" | "manual";
          external_id: string;
          external_url: string | null;
          source_name: string | null;
          is_active: boolean;
          sync_frequency_minutes: number | null;
          last_synced_at: string | null;
          last_sync_status: "idle" | "success" | "failed" | null;
          last_sync_error: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          agent_id: string;
          source: "google_places" | "trustpilot" | "rate_my_agent" | "facebook" | "manual";
          external_id: string;
          external_url?: string | null;
          source_name?: string | null;
          is_active?: boolean;
          sync_frequency_minutes?: number | null;
          last_synced_at?: string | null;
          last_sync_status?: "idle" | "success" | "failed" | null;
          last_sync_error?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["agency_review_sources"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "agency_review_sources_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      external_reviews: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          agent_id: string;
          source_id: string | null;
          source: "google_places" | "trustpilot" | "rate_my_agent" | "facebook" | "manual";
          external_review_id: string;
          reviewer_name: string | null;
          reviewer_avatar_url: string | null;
          rating: number;
          review_text: string | null;
          review_url: string | null;
          reviewed_at: string | null;
          is_approved: boolean;
          is_hidden: boolean;
          is_featured: boolean;
          helpful_count: number | null;
          trust_weight: number | null;
          sync_metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          agent_id: string;
          source_id?: string | null;
          source: "google_places" | "trustpilot" | "rate_my_agent" | "facebook" | "manual";
          external_review_id: string;
          reviewer_name?: string | null;
          reviewer_avatar_url?: string | null;
          rating: number;
          review_text?: string | null;
          review_url?: string | null;
          reviewed_at?: string | null;
          is_approved?: boolean;
          is_hidden?: boolean;
          is_featured?: boolean;
          helpful_count?: number | null;
          trust_weight?: number | null;
          sync_metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["external_reviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "external_reviews_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "external_reviews_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "agency_review_sources";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      broker_enquiry_states: {
        Row: {
          enquiry_id: string;
          created_at: string;
          updated_at: string;
          owner_email: string | null;
          priority: "low" | "normal" | "high" | "urgent";
          stage:
            | "incoming"
            | "qualified"
            | "agent_outreach"
            | "waiting_agent"
            | "waiting_buyer"
            | "handoff"
            | "closed";
          sla_due_at: string | null;
          next_action: string | null;
          last_touch_at: string | null;
          metadata: Json;
        };
        Insert: {
          enquiry_id: string;
          created_at?: string;
          updated_at?: string;
          owner_email?: string | null;
          priority?: "low" | "normal" | "high" | "urgent";
          stage?:
            | "incoming"
            | "qualified"
            | "agent_outreach"
            | "waiting_agent"
            | "waiting_buyer"
            | "handoff"
            | "closed";
          sla_due_at?: string | null;
          next_action?: string | null;
          last_touch_at?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["broker_enquiry_states"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "broker_enquiry_states_enquiry_id_fkey";
            columns: ["enquiry_id"];
            referencedRelation: "enquiries";
            referencedColumns: ["id"];
            isOneToOne: true;
          }
        ];
      };
      broker_enquiry_notes: {
        Row: {
          id: string;
          created_at: string;
          enquiry_id: string;
          author_email: string | null;
          note: string;
          is_internal: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          enquiry_id: string;
          author_email?: string | null;
          note: string;
          is_internal?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["broker_enquiry_notes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "broker_enquiry_notes_enquiry_id_fkey";
            columns: ["enquiry_id"];
            referencedRelation: "enquiries";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type AgentRow = Database["public"]["Tables"]["agents"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type EnquiryRow = Database["public"]["Tables"]["enquiries"]["Row"];
export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
export type ContactSubmissionRow = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type SavedAgentRow = Database["public"]["Tables"]["saved_agents"]["Row"];
export type AgentProfileRow = Database["public"]["Tables"]["agent_profiles"]["Row"];
export type AgencyReviewSourceRow = Database["public"]["Tables"]["agency_review_sources"]["Row"];
export type ExternalReviewRow = Database["public"]["Tables"]["external_reviews"]["Row"];
export type BrokerEnquiryStateRow = Database["public"]["Tables"]["broker_enquiry_states"]["Row"];
export type BrokerEnquiryNoteRow = Database["public"]["Tables"]["broker_enquiry_notes"]["Row"];
