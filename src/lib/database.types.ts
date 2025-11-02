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
      order_trees: {
        Row: {
          id: string
          order_id: string
          species_id: string
          fullness_type: 'thin' | 'medium' | 'full'
          height_feet: number
          unit_price: number
          quantity: number
          fresh_cut: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          species_id: string
          fullness_type: 'thin' | 'medium' | 'full'
          height_feet: number
          unit_price: number
          quantity?: number
          fresh_cut?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          species_id?: string
          fullness_type?: 'thin' | 'medium' | 'full'
          height_feet?: number
          unit_price?: number
          quantity?: number
          fresh_cut?: boolean
          created_at?: string
        }
      }
      order_stands: {
        Row: {
          id: string
          order_id: string
          stand_id: string | null
          unit_price: number
          quantity: number
          is_own_stand: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          stand_id?: string | null
          unit_price: number
          quantity?: number
          is_own_stand?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          stand_id?: string | null
          unit_price?: number
          quantity?: number
          is_own_stand?: boolean
          created_at?: string
        }
      }
      order_wreaths: {
        Row: {
          id: string
          order_id: string
          wreath_id: string
          unit_price: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          wreath_id: string
          unit_price: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          wreath_id?: string
          unit_price?: number
          quantity?: number
          created_at?: string
        }
      }
      species: {
        Row: {
          id: string
          name: string
          description: string
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fullness_variants: {
        Row: {
          id: string
          species_id: string
          fullness_type: 'thin' | 'medium' | 'full'
          image_url: string
          price_per_foot: number
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          species_id: string
          fullness_type: 'thin' | 'medium' | 'full'
          image_url: string
          price_per_foot: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          species_id?: string
          fullness_type?: 'thin' | 'medium' | 'full'
          image_url?: string
          price_per_foot?: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      species_heights: {
        Row: {
          id: string
          species_id: string
          height_feet: number
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          species_id: string
          height_feet: number
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          species_id?: string
          height_feet?: number
          available?: boolean
          created_at?: string
        }
      }
      stands: {
        Row: {
          id: string
          name: string
          price: number
          fits_up_to_feet: number | null
          visible: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          fits_up_to_feet?: number | null
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          fits_up_to_feet?: number | null
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      wreaths: {
        Row: {
          id: string
          size: 'small' | 'medium' | 'large'
          price: number
          visible: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          size: 'small' | 'medium' | 'large'
          price: number
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          size?: 'small' | 'medium' | 'large'
          price?: number
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      delivery_options: {
        Row: {
          id: string
          name: string
          description: string | null
          fee: number
          visible: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          fee: number
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          fee?: number
          visible?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          species_id: string | null
          fullness_type: 'thin' | 'medium' | 'full' | null
          height_feet: number | null
          tree_price: number | null
          stand_id: string | null
          stand_price: number | null
          has_own_stand: boolean | null
          delivery_option_id: string
          delivery_fee: number
          wreath_id: string | null
          wreath_price: number | null
          fresh_cut: boolean | null
          preferred_delivery_date: string | null
          preferred_delivery_time: string | null
          customer_first_name: string
          customer_last_name: string
          customer_email: string
          customer_phone: string
          delivery_street: string
          delivery_unit: string | null
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          total_amount: number
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          species_id?: string | null
          fullness_type?: 'thin' | 'medium' | 'full' | null
          height_feet?: number | null
          tree_price?: number | null
          stand_id?: string | null
          stand_price?: number | null
          has_own_stand?: boolean | null
          delivery_option_id: string
          delivery_fee: number
          wreath_id?: string | null
          wreath_price?: number | null
          fresh_cut?: boolean | null
          preferred_delivery_date?: string | null
          preferred_delivery_time?: string | null
          customer_first_name: string
          customer_last_name: string
          customer_email: string
          customer_phone: string
          delivery_street: string
          delivery_unit?: string | null
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          total_amount: number
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          species_id?: string | null
          fullness_type?: 'thin' | 'medium' | 'full' | null
          height_feet?: number | null
          tree_price?: number | null
          stand_id?: string | null
          stand_price?: number | null
          has_own_stand?: boolean | null
          delivery_option_id?: string
          delivery_fee?: number
          wreath_id?: string | null
          wreath_price?: number | null
          fresh_cut?: boolean | null
          preferred_delivery_date?: string | null
          preferred_delivery_time?: string | null
          customer_first_name?: string
          customer_last_name?: string
          customer_email?: string
          customer_phone?: string
          delivery_street?: string
          delivery_unit?: string | null
          delivery_city?: string
          delivery_state?: string
          delivery_zip?: string
          total_amount?: number
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
