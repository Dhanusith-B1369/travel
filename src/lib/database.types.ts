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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          language_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          country: string
          region: string | null
          description: string | null
          cost_index: number | null
          popularity_score: number
          image_url: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          region?: string | null
          description?: string | null
          cost_index?: number | null
          popularity_score?: number
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          region?: string | null
          description?: string | null
          cost_index?: number | null
          popularity_score?: number
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          cover_photo_url: string | null
          is_public: boolean
          total_budget: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_photo_url?: string | null
          is_public?: boolean
          total_budget?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_photo_url?: string | null
          is_public?: boolean
          total_budget?: number
          created_at?: string
          updated_at?: string
        }
      }
      stops: {
        Row: {
          id: string
          trip_id: string
          city_id: string
          start_date: string | null
          end_date: string | null
          order_index: number
          notes: string | null
          accommodation_cost: number
          transportation_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city_id: string
          start_date?: string | null
          end_date?: string | null
          order_index?: number
          notes?: string | null
          accommodation_cost?: number
          transportation_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          city_id?: string
          start_date?: string | null
          end_date?: string | null
          order_index?: number
          notes?: string | null
          accommodation_cost?: number
          transportation_cost?: number
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          city_id: string
          name: string
          description: string | null
          category: string | null
          estimated_cost: number
          duration_hours: number
          image_url: string | null
          popularity_score: number
          created_at: string
        }
        Insert: {
          id?: string
          city_id: string
          name: string
          description?: string | null
          category?: string | null
          estimated_cost?: number
          duration_hours?: number
          image_url?: string | null
          popularity_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          name?: string
          description?: string | null
          category?: string | null
          estimated_cost?: number
          duration_hours?: number
          image_url?: string | null
          popularity_score?: number
          created_at?: string
        }
      }
      trip_activities: {
        Row: {
          id: string
          stop_id: string
          activity_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          custom_cost: number | null
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          stop_id: string
          activity_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          custom_cost?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          stop_id?: string
          activity_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          custom_cost?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}
