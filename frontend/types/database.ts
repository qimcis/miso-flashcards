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
      decks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          user_id: string
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          user_id: string
          category: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          user_id?: string
          category?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          created_at: string
          deck_id: string
          question: string
          answer: string
          last_reviewed: string | null
          next_review: string | null
          interval: number
          ease_factor: number
        }
        Insert: {
          id?: string
          created_at?: string
          deck_id: string
          question: string
          answer: string
          last_reviewed?: string | null
          next_review?: string | null
          interval?: number
          ease_factor?: number
        }
        Update: {
          id?: string
          created_at?: string
          deck_id?: string
          question?: string
          answer?: string
          last_reviewed?: string | null
          next_review?: string | null
          interval?: number
          ease_factor?: number
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