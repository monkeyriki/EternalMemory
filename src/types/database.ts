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
      ad_slots: {
        Row: {
          adsense_code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          slot_key: string
          updated_at: string
        }
        Insert: {
          adsense_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slot_key: string
          updated_at?: string
        }
        Update: {
          adsense_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slot_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      b2b_subscriptions: {
        Row: {
          account_id: string
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string
          price_cents: number
          provider: string
          provider_subscription_id: string | null
          status: string
        }
        Insert: {
          account_id: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name: string
          price_cents: number
          provider: string
          provider_subscription_id?: string | null
          status?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string
          price_cents?: number
          provider?: string
          provider_subscription_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_entries: {
        Row: {
          author_id: string | null
          created_at: string
          display_name: string
          id: string
          memorial_id: string
          message: string
          status: Database["public"]["Enums"]["guestbook_status"]
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          display_name: string
          id?: string
          memorial_id: string
          message: string
          status?: Database["public"]["Enums"]["guestbook_status"]
        }
        Update: {
          author_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          memorial_id?: string
          message?: string
          status?: Database["public"]["Enums"]["guestbook_status"]
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guestbook_entries_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_media: {
        Row: {
          created_at: string
          id: string
          memorial_id: string
          position: number
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          memorial_id: string
          position?: number
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          memorial_id?: string
          position?: number
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_media_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorials: {
        Row: {
          birth_year: number | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          date_of_birth: string | null
          date_of_death: string | null
          death_year: number | null
          ads_free: boolean
          full_name: string
          id: string
          is_draft: boolean
          managed_by_partner_id: string | null
          owner_id: string
          password_hash: string | null
          slug: string
          hosting_plan: Database["public"]["Enums"]["memorial_hosting_plan"]
          plan_expires_at: string | null
          stripe_subscription_id: string | null
          last_hosting_checkout_session_id: string | null
          state: string | null
          story: string | null
          tags: string[]
          type: Database["public"]["Enums"]["memorial_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["memorial_visibility"]
        }
        Insert: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_death?: string | null
          full_name: string
          id?: string
          is_draft?: boolean
          managed_by_partner_id?: string | null
          owner_id: string
          password_hash?: string | null
          slug: string
          ads_free?: boolean
          hosting_plan?: Database["public"]["Enums"]["memorial_hosting_plan"]
          plan_expires_at?: string | null
          stripe_subscription_id?: string | null
          last_hosting_checkout_session_id?: string | null
          state?: string | null
          story?: string | null
          type: Database["public"]["Enums"]["memorial_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memorial_visibility"]
        }
        Update: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_death?: string | null
          full_name?: string
          id?: string
          is_draft?: boolean
          managed_by_partner_id?: string | null
          owner_id?: string
          password_hash?: string | null
          slug?: string
          ads_free?: boolean
          hosting_plan?: Database["public"]["Enums"]["memorial_hosting_plan"]
          plan_expires_at?: string | null
          stripe_subscription_id?: string | null
          last_hosting_checkout_session_id?: string | null
          state?: string | null
          story?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["memorial_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memorial_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "memorials_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          buyer_email: string | null
          created_at: string
          currency: string
          guest_token: string | null
          id: string
          memorial_id: string | null
          provider: string
          provider_payment_id: string | null
          provider_session_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          buyer_email?: string | null
          created_at?: string
          currency?: string
          guest_token?: string | null
          id?: string
          memorial_id?: string | null
          provider: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          buyer_email?: string | null
          created_at?: string
          currency?: string
          guest_token?: string | null
          id?: string
          memorial_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      ip_bans: {
        Row: {
          id: string
          cidr: string
          reason: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          cidr: string
          reason?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          cidr?: string
          reason?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          id: string
          reporter_id: string | null
          memorial_id: string
          tribute_id: string | null
          reason: "spam" | "offensive" | "inappropriate" | "other"
          custom_message: string | null
          status: "open" | "reviewed" | "dismissed"
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          memorial_id: string
          tribute_id?: string | null
          reason: "spam" | "offensive" | "inappropriate" | "other"
          custom_message?: string | null
          status?: "open" | "reviewed" | "dismissed"
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string | null
          memorial_id?: string
          tribute_id?: string | null
          reason?: "spam" | "offensive" | "inappropriate" | "other"
          custom_message?: string | null
          status?: "open" | "reviewed" | "dismissed"
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          code_value: string
          created_at: string
          id: string
          image_url: string | null
          memorial_id: string
        }
        Insert: {
          code_value: string
          created_at?: string
          id?: string
          image_url?: string | null
          memorial_id: string
        }
        Update: {
          code_value?: string
          created_at?: string
          id?: string
          image_url?: string | null
          memorial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_premium: boolean
          name: string
          price_cents: number
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          name: string
          price_cents: number
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      virtual_tributes: {
        Row: {
          created_at: string
          highlight_until: string | null
          id: string
          memorial_id: string
          message: string | null
          order_id: string
          purchaser_id: string | null
          store_item_id: string
        }
        Insert: {
          created_at?: string
          highlight_until?: string | null
          id?: string
          memorial_id: string
          message?: string | null
          order_id: string
          purchaser_id?: string | null
          store_item_id: string
        }
        Update: {
          created_at?: string
          highlight_until?: string | null
          id?: string
          memorial_id?: string
          message?: string | null
          order_id?: string
          purchaser_id?: string | null
          store_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tributes_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tributes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tributes_purchaser_id_fkey"
            columns: ["purchaser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tributes_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_ip_address_banned: { Args: { check_ip: string }; Returns: boolean }
      is_b2b: { Args: never; Returns: boolean }
    }
    Enums: {
      guestbook_status: "pending" | "approved" | "rejected"
      memorial_type: "human" | "pet"
      memorial_visibility: "public" | "unlisted" | "password_protected"
      memorial_hosting_plan: "basic" | "premium" | "lifetime"
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
      guestbook_status: ["pending", "approved", "rejected"],
      memorial_type: ["human", "pet"],
      memorial_visibility: ["public", "unlisted", "password_protected"],
      memorial_hosting_plan: ["basic", "premium", "lifetime"],
    },
  },
} as const
