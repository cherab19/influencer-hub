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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      advertiser_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      campaign_applications: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          influencer_id: string
          price_proposal: number | null
          proposal: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          influencer_id: string
          price_proposal?: number | null
          proposal?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          influencer_id?: string
          price_proposal?: number | null
          proposal?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string
          budget: number | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_category: Database["public"]["Enums"]["category_type"] | null
          target_platform: Database["public"]["Enums"]["platform_type"] | null
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_category?: Database["public"]["Enums"]["category_type"] | null
          target_platform?: Database["public"]["Enums"]["platform_type"] | null
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_category?: Database["public"]["Enums"]["category_type"] | null
          target_platform?: Database["public"]["Enums"]["platform_type"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      influencer_profiles: {
        Row: {
          ad_price: number | null
          bio: string | null
          category: Database["public"]["Enums"]["category_type"] | null
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          id: string
          is_verified: boolean | null
          location: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_price?: number | null
          bio?: string | null
          category?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_price?: number | null
          bio?: string | null
          category?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          campaign_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          currency: string | null
          id: string
          payment_method: string | null
          status: string | null
          subscription_id: string | null
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          campaign_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          campaign_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          campaign_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          followers_count: number | null
          handle: string | null
          id: string
          influencer_id: string
          platform: Database["public"]["Enums"]["platform_type"]
          url: string | null
        }
        Insert: {
          created_at?: string
          followers_count?: number | null
          handle?: string | null
          id?: string
          influencer_id: string
          platform: Database["public"]["Enums"]["platform_type"]
          url?: string | null
        }
        Update: {
          created_at?: string
          followers_count?: number | null
          handle?: string | null
          id?: string
          influencer_id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          display_name: string
          features: Json | null
          id: string
          is_featured: boolean | null
          name: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
        }
        Insert: {
          created_at?: string
          display_name: string
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          name: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          name?: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "withdrawn"
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      category_type:
        | "comedy"
        | "lifestyle"
        | "tech"
        | "beauty"
        | "education"
        | "food"
        | "travel"
        | "sports"
        | "music"
        | "fashion"
        | "health"
        | "business"
      platform_type:
        | "tiktok"
        | "instagram"
        | "youtube"
        | "facebook"
        | "twitter"
        | "telegram"
      profile_status: "pending" | "approved" | "rejected" | "suspended"
      subscription_plan: "free" | "pro" | "elite"
      subscription_status: "active" | "inactive" | "cancelled" | "expired"
      user_role: "influencer" | "advertiser" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "accepted", "rejected", "withdrawn"],
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      category_type: [
        "comedy",
        "lifestyle",
        "tech",
        "beauty",
        "education",
        "food",
        "travel",
        "sports",
        "music",
        "fashion",
        "health",
        "business",
      ],
      platform_type: [
        "tiktok",
        "instagram",
        "youtube",
        "facebook",
        "twitter",
        "telegram",
      ],
      profile_status: ["pending", "approved", "rejected", "suspended"],
      subscription_plan: ["free", "pro", "elite"],
      subscription_status: ["active", "inactive", "cancelled", "expired"],
      user_role: ["influencer", "advertiser", "admin"],
    },
  },
} as const
