/**
 * Mirrors supabase/migrations. Regenerate after schema changes with:
 * npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type IncomeCategoryEnum = "salary" | "business" | "freelance" | "other";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: Timestamps & {
          id: string;
          name: string;
          email: string;
          currency: string;
        };
        Insert: {
          id: string;
          name?: string;
          email: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      income: {
        Row: Timestamps & {
          id: string;
          user_id: string;
          title: string;
          category: IncomeCategoryEnum;
          amount: number;
          date: string;
          month: number;
          year: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category?: IncomeCategoryEnum;
          amount: number;
          date?: string;
          notes?: string | null;
        };
        Update: {
          title?: string;
          category?: IncomeCategoryEnum;
          amount?: number;
          date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      expense_categories: {
        Row: Timestamps & {
          id: string;
          user_id: string | null;
          name: string;
          color: string;
          icon: string;
          budget_percentage: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          color?: string;
          icon?: string;
          budget_percentage?: number | null;
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string;
          budget_percentage?: number | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: Timestamps & {
          id: string;
          user_id: string;
          title: string;
          category_id: string | null;
          amount: number;
          expense_date: string;
          month: number;
          year: number;
          is_recurring: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category_id?: string | null;
          amount: number;
          expense_date?: string;
          is_recurring?: boolean;
          notes?: string | null;
        };
        Update: {
          title?: string;
          category_id?: string | null;
          amount?: number;
          expense_date?: string;
          is_recurring?: boolean;
          notes?: string | null;
        };
        Relationships: [];
      };
      monthly_budget: {
        Row: Timestamps & {
          id: string;
          user_id: string;
          month: number;
          year: number;
          expected_income: number;
          planned_savings: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: number;
          year: number;
          expected_income?: number;
          planned_savings?: number;
        };
        Update: {
          expected_income?: number;
          planned_savings?: number;
        };
        Relationships: [];
      };
      saving_goals: {
        Row: Timestamps & {
          id: string;
          user_id: string;
          goal_name: string;
          target_amount: number;
          saved_amount: number;
          deadline: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_name: string;
          target_amount: number;
          saved_amount?: number;
          deadline?: string | null;
        };
        Update: {
          goal_name?: string;
          target_amount?: number;
          saved_amount?: number;
          deadline?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      income_category: IncomeCategoryEnum;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
