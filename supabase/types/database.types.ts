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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          ip_address: unknown
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          ip_address?: unknown
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          ip_address?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      commerce_aisles: {
        Row: {
          commerce_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          commerce_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          commerce_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_aisles_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_categories: {
        Row: {
          aisle_id: string | null
          commerce_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_category_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          aisle_id?: string | null
          commerce_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_category_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          aisle_id?: string | null
          commerce_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_category_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_categories_aisle_id_fkey"
            columns: ["aisle_id"]
            isOneToOne: false
            referencedRelation: "commerce_aisles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_categories_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "commerce_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_claims: {
        Row: {
          category: string
          created_at: string
          customer_id: string | null
          description: string
          id: string
          order_id: string
          refund_amount_fcfa: number
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          customer_id?: string | null
          description: string
          id?: string
          order_id: string
          refund_amount_fcfa?: number
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          customer_id?: string | null
          description?: string
          id?: string
          order_id?: string
          refund_amount_fcfa?: number
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_claims_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_claims_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_hours: {
        Row: {
          close_time: string | null
          commerce_id: string
          created_at: string
          id: string
          is_closed: boolean
          open_time: string | null
          updated_at: string
          weekday: number
        }
        Insert: {
          close_time?: string | null
          commerce_id: string
          created_at?: string
          id?: string
          is_closed?: boolean
          open_time?: string | null
          updated_at?: string
          weekday: number
        }
        Update: {
          close_time?: string | null
          commerce_id?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          open_time?: string | null
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "commerce_hours_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_members: {
        Row: {
          commerce_id: string
          created_at: string
          id: string
          member_role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commerce_id: string
          created_at?: string
          id?: string
          member_role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commerce_id?: string
          created_at?: string
          id?: string
          member_role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_members_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_order_packages: {
        Row: {
          created_at: string
          id: string
          order_id: string
          package_code: string
          package_number: number
          status: string
          updated_at: string
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          package_code: string
          package_number: number
          status?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          package_code?: string
          package_number?: number
          status?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_order_packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_product_variants: {
        Row: {
          availability: string
          barcode: string | null
          created_at: string
          id: string
          name: string
          price_fcfa: number
          product_id: string
          sku: string | null
          updated_at: string
        }
        Insert: {
          availability?: string
          barcode?: string | null
          created_at?: string
          id?: string
          name: string
          price_fcfa: number
          product_id: string
          sku?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string
          barcode?: string | null
          created_at?: string
          id?: string
          name?: string
          price_fcfa?: number
          product_id?: string
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_products: {
        Row: {
          availability: string
          barcode: string | null
          base_price_fcfa: number
          brand: string | null
          category_id: string | null
          commerce_id: string
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          internal_reference: string | null
          is_active: boolean
          is_substitutable: boolean
          name: string
          sales_mode: string
          unit: string
          updated_at: string
        }
        Insert: {
          availability?: string
          barcode?: string | null
          base_price_fcfa: number
          brand?: string | null
          category_id?: string | null
          commerce_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          internal_reference?: string | null
          is_active?: boolean
          is_substitutable?: boolean
          name: string
          sales_mode?: string
          unit: string
          updated_at?: string
        }
        Update: {
          availability?: string
          barcode?: string | null
          base_price_fcfa?: number
          brand?: string | null
          category_id?: string | null
          commerce_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          internal_reference?: string | null
          is_active?: boolean
          is_substitutable?: boolean
          name?: string
          sales_mode?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "commerce_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_products_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_promotions: {
        Row: {
          commerce_id: string
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          product_id: string | null
          promotion_type: string
          starts_at: string
          updated_at: string
          value: number
        }
        Insert: {
          commerce_id: string
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          promotion_type: string
          starts_at: string
          updated_at?: string
          value: number
        }
        Update: {
          commerce_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          promotion_type?: string
          starts_at?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "commerce_promotions_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_reviews: {
        Row: {
          comment: string | null
          commerce_id: string
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rating: number
          status: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          commerce_id: string
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rating: number
          status?: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          commerce_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rating?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_reviews_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_substitution_proposals: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: string
          id: string
          order_item_id: string
          price_difference_fcfa: number
          proposed_product_id: string
          proposed_quantity: number
          proposed_unit_price_fcfa: number
          reason: string | null
          requested_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          id?: string
          order_item_id: string
          price_difference_fcfa?: number
          proposed_product_id: string
          proposed_quantity: number
          proposed_unit_price_fcfa: number
          reason?: string | null
          requested_quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          id?: string
          order_item_id?: string
          price_difference_fcfa?: number
          proposed_product_id?: string
          proposed_quantity?: number
          proposed_unit_price_fcfa?: number
          reason?: string | null
          requested_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_substitution_proposals_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_substitution_proposals_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_substitution_proposals_proposed_product_id_fkey"
            columns: ["proposed_product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerces: {
        Row: {
          address_text: string | null
          city: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_open: boolean
          location: unknown
          location_accuracy_m: number | null
          location_verified_at: string | null
          name: string
          neighborhood: string | null
          operational_status: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_text?: string | null
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_open?: boolean
          location?: unknown
          location_accuracy_m?: number | null
          location_verified_at?: string | null
          name: string
          neighborhood?: string | null
          operational_status?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_text?: string | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_open?: boolean
          location?: unknown
          location_accuracy_m?: number | null
          location_verified_at?: string | null
          name?: string
          neighborhood?: string | null
          operational_status?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_text: string
          city: string
          created_at: string
          delivery_notes: string | null
          id: string
          is_default: boolean
          label: string | null
          location: unknown
          location_accuracy_m: number | null
          neighborhood: string | null
          phone: string | null
          recipient_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_text: string
          city: string
          created_at?: string
          delivery_notes?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          location: unknown
          location_accuracy_m?: number | null
          neighborhood?: string | null
          phone?: string | null
          recipient_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_text?: string
          city?: string
          created_at?: string
          delivery_notes?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          location?: unknown
          location_accuracy_m?: number | null
          neighborhood?: string | null
          phone?: string | null
          recipient_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assignment_method: Database["public"]["Enums"]["assignment_method"]
          completed_at: string | null
          created_at: string
          distance_estimate_m: number | null
          driver_id: string
          eta_seconds: number | null
          id: string
          order_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assignment_method?: Database["public"]["Enums"]["assignment_method"]
          completed_at?: string | null
          created_at?: string
          distance_estimate_m?: number | null
          driver_id: string
          eta_seconds?: number | null
          id?: string
          order_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assignment_method?: Database["public"]["Enums"]["assignment_method"]
          completed_at?: string | null
          created_at?: string
          distance_estimate_m?: number | null
          driver_id?: string
          eta_seconds?: number | null
          id?: string
          order_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "delivery_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_drivers: {
        Row: {
          availability: Database["public"]["Enums"]["driver_availability"]
          created_at: string
          current_location: unknown
          current_order_id: string | null
          id: string
          location_accuracy_m: number | null
          location_updated_at: string | null
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["driver_availability"]
          created_at?: string
          current_location?: unknown
          current_order_id?: string | null
          id?: string
          location_accuracy_m?: number | null
          location_updated_at?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["driver_availability"]
          created_at?: string
          current_location?: unknown
          current_order_id?: string | null
          id?: string
          location_accuracy_m?: number | null
          location_updated_at?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_drivers_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          base_fee_fcfa: number
          boundary: unknown
          city: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_fee_fcfa: number
          boundary?: unknown
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_fee_fcfa?: number
          boundary?: unknown
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_path: string
          is_available: boolean
          name: string
          price_fcfa: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path: string
          is_available?: boolean
          name: string
          price_fcfa: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string
          is_available?: boolean
          name?: string
          price_fcfa?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          accuracy_m: number | null
          driver_id: string
          id: number
          location: unknown
          recorded_at: string
        }
        Insert: {
          accuracy_m?: number | null
          driver_id: string
          id?: number
          location: unknown
          recorded_at?: string
        }
        Update: {
          accuracy_m?: number | null
          driver_id?: string
          id?: number
          location?: unknown
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "delivery_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          id: string
          points_balance: number
          reserved_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_balance?: number
          reserved_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_balance?: number
          reserved_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points_delta: number
          type: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points_delta: number
          type: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points_delta?: number
          type?: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json
          id: string
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          commerce_product_id: string | null
          created_at: string
          dish_id: string | null
          dish_name_snapshot: string
          id: string
          line_total_fcfa: number
          order_id: string
          promotion_discount_fcfa: number
          quantity: number
          unit_price_fcfa: number
        }
        Insert: {
          commerce_product_id?: string | null
          created_at?: string
          dish_id?: string | null
          dish_name_snapshot: string
          id?: string
          line_total_fcfa: number
          order_id: string
          promotion_discount_fcfa?: number
          quantity: number
          unit_price_fcfa: number
        }
        Update: {
          commerce_product_id?: string | null
          created_at?: string
          dish_id?: string | null
          dish_name_snapshot?: string
          id?: string
          line_total_fcfa?: number
          order_id?: string
          promotion_discount_fcfa?: number
          quantity?: number
          unit_price_fcfa?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_commerce_product_id_fkey"
            columns: ["commerce_product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          order_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          order_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          order_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          commerce_id: string | null
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          delivery_address_snapshot: Json
          delivery_fee_fcfa: number
          delivery_location: unknown
          delivery_zone_id: string | null
          discount_fcfa: number
          guest_name: string | null
          guest_phone: string | null
          id: string
          order_number: string
          order_type: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          preparation_minutes: number | null
          ready_at: string | null
          restaurant_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_fcfa: number
          total_fcfa: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          commerce_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address_snapshot: Json
          delivery_fee_fcfa: number
          delivery_location: unknown
          delivery_zone_id?: string | null
          discount_fcfa?: number
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number: string
          order_type?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preparation_minutes?: number | null
          ready_at?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_fcfa: number
          total_fcfa: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          commerce_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address_snapshot?: Json
          delivery_fee_fcfa?: number
          delivery_location?: unknown
          delivery_zone_id?: string | null
          discount_fcfa?: number
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string
          order_type?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preparation_minutes?: number | null
          ready_at?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_fcfa?: number
          total_fcfa?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_fcfa: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          paid_at: string | null
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          idempotency_key: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          paid_at?: string | null
          provider: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          idempotency_key?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          paid_at?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          dish_id: string | null
          ends_at: string
          id: string
          is_active: boolean
          restaurant_id: string
          starts_at: string
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          dish_id?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          restaurant_id: string
          starts_at: string
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          dish_id?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          restaurant_id?: string
          starts_at?: string
          type?: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_fcfa: number
          created_at: string
          id: string
          payment_id: string
          provider_reference: string | null
          reason: string | null
          status: Database["public"]["Enums"]["refund_status"]
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          id?: string
          payment_id: string
          provider_reference?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          id?: string
          payment_id?: string
          provider_reference?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_hours: {
        Row: {
          close_time: string | null
          created_at: string
          id: string
          is_closed: boolean
          open_time: string | null
          restaurant_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          open_time?: string | null
          restaurant_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          close_time?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          open_time?: string | null
          restaurant_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_members: {
        Row: {
          created_at: string
          id: string
          member_role: Database["public"]["Enums"]["restaurant_member_role"]
          restaurant_id: string
          status: Database["public"]["Enums"]["restaurant_member_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_role: Database["public"]["Enums"]["restaurant_member_role"]
          restaurant_id: string
          status?: Database["public"]["Enums"]["restaurant_member_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_role?: Database["public"]["Enums"]["restaurant_member_role"]
          restaurant_id?: string
          status?: Database["public"]["Enums"]["restaurant_member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address_text: string | null
          city: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_open: boolean
          location: unknown
          location_accuracy_m: number | null
          location_verified_at: string | null
          name: string
          neighborhood: string | null
          phone: string | null
          rating_average: number
          rating_count: number
          status: Database["public"]["Enums"]["restaurant_status"]
          updated_at: string
        }
        Insert: {
          address_text?: string | null
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_open?: boolean
          location?: unknown
          location_accuracy_m?: number | null
          location_verified_at?: string | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          rating_average?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["restaurant_status"]
          updated_at?: string
        }
        Update: {
          address_text?: string | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_open?: boolean
          location?: unknown
          location_accuracy_m?: number | null
          location_verified_at?: string | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          rating_average?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["restaurant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rating: number
          restaurant_id: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rating: number
          restaurant_id: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rating?: number
          restaurant_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_delivery: { Args: { p_assignment_id: string }; Returns: undefined }
      add_restaurant_member: {
        Args: {
          p_member_role: Database["public"]["Enums"]["restaurant_member_role"]
          p_restaurant_id: string
          p_user_id: string
        }
        Returns: string
      }
      assign_delivery:
        | { Args: { p_order_id: string }; Returns: string }
        | { Args: { p_driver_id: string; p_order_id: string }; Returns: string }
      change_driver_status: {
        Args: {
          p_driver_id: string
          p_status: Database["public"]["Enums"]["driver_status"]
        }
        Returns: boolean
      }
      change_restaurant_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["restaurant_status"]
          p_reason?: string
          p_restaurant_id: string
        }
        Returns: Database["public"]["Enums"]["restaurant_status"]
      }
      create_category: {
        Args: { p_description?: string; p_name: string }
        Returns: string
      }
      create_commerce_claim: {
        Args: { p_category: string; p_description: string; p_order_id: string }
        Returns: string
      }
      create_commerce_order: {
        Args: {
          p_commerce_id: string
          p_customer_id: string
          p_delivery_address_snapshot: Json
          p_delivery_location: unknown
          p_delivery_zone_id: string
          p_guest_name: string
          p_guest_phone: string
          p_idempotency_key: string
          p_items: Json
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_use_loyalty?: boolean
        }
        Returns: string
      }
      create_commerce_substitution_proposal: {
        Args: {
          p_order_item_id: string
          p_proposed_product_id: string
          p_proposed_quantity: number
          p_reason?: string
        }
        Returns: string
      }
      create_customer_address: {
        Args: {
          p_address_text: string
          p_city: string
          p_delivery_notes?: string
          p_is_default?: boolean
          p_label: string
          p_location: unknown
          p_location_accuracy_m?: number
          p_neighborhood: string
          p_phone: string
          p_recipient_name: string
        }
        Returns: string
      }
      create_delivery_driver: { Args: { p_user_id: string }; Returns: string }
      create_delivery_zone: {
        Args: {
          p_base_fee_fcfa: number
          p_boundary: unknown
          p_city: string
          p_name: string
        }
        Returns: string
      }
      create_dish: {
        Args: {
          p_category_id?: string
          p_description?: string
          p_image_path?: string
          p_name?: string
          p_price_fcfa?: number
          p_restaurant_id: string
        }
        Returns: string
      }
      create_order: {
        Args: {
          p_customer_id: string
          p_delivery_address_snapshot: Json
          p_delivery_location: unknown
          p_delivery_zone_id: string
          p_guest_name: string
          p_guest_phone: string
          p_idempotency_key: string
          p_items: Json
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_restaurant_id: string
          p_use_loyalty?: boolean
        }
        Returns: string
      }
      create_promotion: {
        Args: {
          p_dish_id?: string
          p_ends_at?: string
          p_restaurant_id: string
          p_starts_at?: string
          p_type?: Database["public"]["Enums"]["promotion_type"]
          p_value?: number
        }
        Returns: string
      }
      create_restaurant: {
        Args: {
          p_address_text?: string
          p_city: string
          p_description?: string
          p_email?: string
          p_location?: unknown
          p_location_accuracy_m?: number
          p_name: string
          p_neighborhood?: string
          p_phone?: string
        }
        Returns: string
      }
      decide_commerce_substitution: {
        Args: { p_decision: string; p_proposal_id: string }
        Returns: undefined
      }
      delete_category: { Args: { p_category_id: string }; Returns: boolean }
      delete_customer_address: {
        Args: { p_address_id: string }
        Returns: boolean
      }
      delete_delivery_zone: { Args: { p_zone_id: string }; Returns: boolean }
      delete_dish: { Args: { p_dish_id: string }; Returns: boolean }
      delete_promotion: { Args: { p_promotion_id: string }; Returns: boolean }
      get_guest_order_status: {
        Args: { p_guest_phone: string; p_order_id: string }
        Returns: {
          accepted_at: string
          cancelled_at: string
          created_at: string
          delivered_at: string
          delivery_address_snapshot: Json
          delivery_fee_fcfa: number
          discount_fcfa: number
          order_id: string
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          ready_at: string
          restaurant_name: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_fcfa: number
          total_fcfa: number
          updated_at: string
        }[]
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      moderate_commerce_review: {
        Args: { p_review_id: string; p_status: string }
        Returns: undefined
      }
      reassign_delivery: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: string
      }
      remove_commerce_order_item_after_substitution_refusal: {
        Args: { p_proposal_id: string; p_reason?: string }
        Returns: undefined
      }
      remove_restaurant_member: {
        Args: { p_member_id: string }
        Returns: boolean
      }
      request_refund: {
        Args: { p_amount_fcfa: number; p_payment_id: string; p_reason?: string }
        Returns: string
      }
      resolve_commerce_claim: {
        Args: {
          p_claim_id: string
          p_refund_amount_fcfa?: number
          p_resolution?: string
          p_status: string
        }
        Returns: undefined
      }
      set_my_driver_availability: {
        Args: {
          p_availability: Database["public"]["Enums"]["driver_availability"]
        }
        Returns: boolean
      }
      set_restaurant_open: {
        Args: { p_is_open: boolean; p_restaurant_id: string }
        Returns: boolean
      }
      submit_commerce_review: {
        Args: { p_comment?: string; p_order_id: string; p_rating: number }
        Returns: string
      }
      submit_review: {
        Args: { p_comment?: string; p_order_id: string; p_rating: number }
        Returns: string
      }
      transition_delivery_assignment: {
        Args: {
          p_assignment_id: string
          p_to_status: Database["public"]["Enums"]["assignment_status"]
        }
        Returns: undefined
      }
      transition_order: {
        Args: {
          p_order_id: string
          p_reason?: string
          p_to_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      update_category: {
        Args: {
          p_category_id: string
          p_description?: string
          p_is_active?: boolean
          p_name?: string
        }
        Returns: boolean
      }
      update_customer_address: {
        Args: {
          p_address_id: string
          p_address_text?: string
          p_city?: string
          p_delivery_notes?: string
          p_is_default?: boolean
          p_label?: string
          p_location?: unknown
          p_location_accuracy_m?: number
          p_neighborhood?: string
          p_phone?: string
          p_recipient_name?: string
        }
        Returns: boolean
      }
      update_delivery_zone: {
        Args: {
          p_base_fee_fcfa?: number
          p_boundary?: unknown
          p_city?: string
          p_is_active?: boolean
          p_name?: string
          p_zone_id: string
        }
        Returns: boolean
      }
      update_dish: {
        Args: {
          p_category_id?: string
          p_description?: string
          p_dish_id: string
          p_image_path?: string
          p_is_available?: boolean
          p_name?: string
          p_price_fcfa?: number
        }
        Returns: boolean
      }
      update_driver_location: {
        Args: { p_accuracy_m?: number; p_location: unknown }
        Returns: undefined
      }
      update_my_profile: {
        Args: { p_avatar_url?: string; p_full_name?: string; p_phone?: string }
        Returns: boolean
      }
      update_my_restaurant: {
        Args: {
          p_address_text?: string
          p_city?: string
          p_description?: string
          p_email?: string
          p_is_open?: boolean
          p_location?: unknown
          p_location_accuracy_m?: number
          p_name: string
          p_neighborhood?: string
          p_phone?: string
          p_restaurant_id: string
        }
        Returns: boolean
      }
      update_promotion: {
        Args: {
          p_dish_id?: string
          p_ends_at?: string
          p_is_active?: boolean
          p_promotion_id: string
          p_starts_at?: string
          p_type?: Database["public"]["Enums"]["promotion_type"]
          p_value?: number
        }
        Returns: boolean
      }
      update_restaurant_member: {
        Args: {
          p_member_id: string
          p_member_role: Database["public"]["Enums"]["restaurant_member_role"]
          p_status: Database["public"]["Enums"]["restaurant_member_status"]
        }
        Returns: boolean
      }
      upsert_restaurant_hours: {
        Args: {
          p_close_time: string
          p_is_closed?: boolean
          p_open_time: string
          p_restaurant_id: string
          p_weekday: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "client" | "restaurant_owner" | "driver" | "admin"
      assignment_method: "automatic" | "manual"
      assignment_status:
        | "offered"
        | "assigned"
        | "accepted"
        | "picked_up"
        | "delivering"
        | "completed"
        | "rejected"
        | "cancelled"
      driver_availability: "offline" | "available" | "busy" | "unavailable"
      driver_status: "pending" | "active" | "suspended"
      loyalty_transaction_type: "earned" | "redeemed" | "adjusted" | "expired"
      notification_channel: "in_app" | "push" | "sms"
      notification_status: "pending" | "sent" | "failed" | "read"
      order_status:
        | "received"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "waiting_client_decision"
      payment_method: "orange_money" | "moov_money"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
        | "partially_refunded"
      profile_status: "active" | "suspended" | "pending"
      promotion_type: "percentage" | "fixed"
      refund_status: "pending" | "processed" | "failed" | "cancelled"
      restaurant_member_role: "owner" | "manager" | "staff"
      restaurant_member_status: "active" | "suspended"
      restaurant_status: "pending" | "approved" | "suspended" | "rejected"
      review_status: "pending" | "published" | "hidden" | "rejected"
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
    Enums: {
      app_role: ["client", "restaurant_owner", "driver", "admin"],
      assignment_method: ["automatic", "manual"],
      assignment_status: [
        "offered",
        "assigned",
        "accepted",
        "picked_up",
        "delivering",
        "completed",
        "rejected",
        "cancelled",
      ],
      driver_availability: ["offline", "available", "busy", "unavailable"],
      driver_status: ["pending", "active", "suspended"],
      loyalty_transaction_type: ["earned", "redeemed", "adjusted", "expired"],
      notification_channel: ["in_app", "push", "sms"],
      notification_status: ["pending", "sent", "failed", "read"],
      order_status: [
        "received",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "waiting_client_decision",
      ],
      payment_method: ["orange_money", "moov_money"],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
        "partially_refunded",
      ],
      profile_status: ["active", "suspended", "pending"],
      promotion_type: ["percentage", "fixed"],
      refund_status: ["pending", "processed", "failed", "cancelled"],
      restaurant_member_role: ["owner", "manager", "staff"],
      restaurant_member_status: ["active", "suspended"],
      restaurant_status: ["pending", "approved", "suspended", "rejected"],
      review_status: ["pending", "published", "hidden", "rejected"],
    },
  },
} as const
