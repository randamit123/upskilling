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
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          role: string | null
          bio: string | null
          organization: string | null
          skills: Json[] | null
          learning_goals: Json[] | null
          topics_of_interest: string[] | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          bio?: string | null
          organization?: string | null
          skills?: Json[] | null
          learning_goals?: Json[] | null
          topics_of_interest?: string[] | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          bio?: string | null
          organization?: string | null
          skills?: Json[] | null
          learning_goals?: Json[] | null
          topics_of_interest?: string[] | null
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
