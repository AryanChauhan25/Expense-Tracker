export const INCOME_CATEGORIES = [
  "salary",
  "business",
  "freelance",
  "other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  currency: string;
  created_at: string;
};

export type IncomeRecord = {
  id: string;
  user_id: string;
  title: string;
  category: IncomeCategory;
  amount: number;
  month: number;
  year: number;
  date: string;
  notes: string | null;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget_percentage: number | null;
};

export type ExpenseRecord = {
  id: string;
  user_id: string;
  title: string;
  category_id: string;
  amount: number;
  expense_date: string;
  month: number;
  year: number;
  is_recurring: boolean;
  notes: string | null;
};

export type MonthlyBudget = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  expected_income: number;
  planned_savings: number;
};

export type SavingGoal = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
};
