export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          customer_id: string
          formatted_address: string
          id: string
          lat: number | null
          lng: number | null
          place_id: string | null
          postal_code: string | null
          state: string | null
          street_name: string | null
          street_number: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          customer_id: string
          formatted_address: string
          id?: string
          lat?: number | null
          lng?: number | null
          place_id?: string | null
          postal_code?: string | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string
          formatted_address?: string
          id?: string
          lat?: number | null
          lng?: number | null
          place_id?: string | null
          postal_code?: string | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          address_id: string
          agreement_status: string
          created_at: string
          customer_id: string
          id: string
          notes: Json | null
          quote_id: string
          signed_date: string | null
          updated_at: string | null
        }
        Insert: {
          address_id: string
          agreement_status?: string
          created_at?: string
          customer_id: string
          id?: string
          notes?: Json | null
          quote_id: string
          signed_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address_id?: string
          agreement_status?: string
          created_at?: string
          customer_id?: string
          id?: string
          notes?: Json | null
          quote_id?: string
          signed_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      installations: {
        Row: {
          agreement_id: string
          created_at: string
          id: string
          installation_date: string | null
          installation_photos: Json | null
          installed_by: string | null
          sign_off: boolean
          updated_at: string | null
        }
        Insert: {
          agreement_id: string
          created_at?: string
          id?: string
          installation_date?: string | null
          installation_photos?: Json | null
          installed_by?: string | null
          sign_off?: boolean
          updated_at?: string | null
        }
        Update: {
          agreement_id?: string
          created_at?: string
          id?: string
          installation_date?: string | null
          installation_photos?: Json | null
          installed_by?: string | null
          sign_off?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installations_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          agreement_id: string
          amount: number
          created_at: string
          id: string
          invoice_status: string | null
          invoice_type: string
          last_error: string | null
          metadata: Json | null
          paid: boolean
          payment_date: string | null
          payment_intent_id: string | null
          payment_method_id: string | null
          retry_count: number
          stripe_customer_id: string | null
          stripe_payment_link: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_id: string
          amount?: number
          created_at?: string
          id?: string
          invoice_status?: string | null
          invoice_type: string
          last_error?: string | null
          metadata?: Json | null
          paid?: boolean
          payment_date?: string | null
          payment_intent_id?: string | null
          payment_method_id?: string | null
          retry_count?: number
          stripe_customer_id?: string | null
          stripe_payment_link?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_id?: string
          amount?: number
          created_at?: string
          id?: string
          invoice_status?: string | null
          invoice_type?: string
          last_error?: string | null
          metadata?: Json | null
          paid?: boolean
          payment_date?: string | null
          payment_intent_id?: string | null
          payment_method_id?: string | null
          retry_count?: number
          stripe_customer_id?: string | null
          stripe_payment_link?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          mobility_type: string | null
          notes: Json | null
          ramp_length: number | null
          rental_duration: string | null
          status: string
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          mobility_type?: string | null
          notes?: Json | null
          ramp_length?: number | null
          rental_duration?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          mobility_type?: string | null
          notes?: Json | null
          ramp_length?: number | null
          rental_duration?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          customer_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          customer_id: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          stripe_payment_method_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          customer_id: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          customer_id?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          address_id: string
          created_at: string
          customer_id: string
          flat_rate: number | null
          id: string
          install_date: string | null
          lead_id: string
          monthly_rental_rate: number
          notes: Json | null
          quote_status: string
          removal_date: string | null
          rental_type: string
          setup_fee: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          address_id: string
          created_at?: string
          customer_id: string
          flat_rate?: number | null
          id?: string
          install_date?: string | null
          lead_id: string
          monthly_rental_rate?: number
          notes?: Json | null
          quote_status?: string
          removal_date?: string | null
          rental_type: string
          setup_fee?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          address_id?: string
          created_at?: string
          customer_id?: string
          flat_rate?: number | null
          id?: string
          install_date?: string | null
          lead_id?: string
          monthly_rental_rate?: number
          notes?: Json | null
          quote_status?: string
          removal_date?: string | null
          rental_type?: string
          setup_fee?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          name: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          name: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          name?: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          agreement_id: string
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_id: string
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_id?: string
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          id: string
          created_at: string
          name: string
          type: 'RAMP' | 'LANDING'
          length: number
          width: number | null
          price_per_day: number
          price_per_month: number
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: 'RAMP' | 'LANDING'
          length: number
          width: number | null
          price_per_day: number
          price_per_month: number
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: 'RAMP' | 'LANDING'
          length?: number
          width?: number | null
          price_per_day?: number
          price_per_month?: number
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      setting_type: "number" | "text" | "boolean"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
