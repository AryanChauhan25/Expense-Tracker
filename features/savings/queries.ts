import { createClient } from "@/lib/supabase/server";
import {
  decodeGoalName,
  type SavingGoalType,
  type SavingsFilters,
} from "@/lib/validations/savings";
import type { Tables } from "@/types/database";
import { clampPercent } from "@/utils/finance-calculations";

export type SavingGoalRow = Tables<"saving_goals">;

export type SavingGoalView = SavingGoalRow & {
  type: SavingGoalType;
  displayName: string;
  progress: number;
  remaining: number;
  isCompleted: boolean;
  isOverdue: boolean;
};

export type SavingsSummary = {
  totalTarget: number;
  totalSaved: number;
  totalRemaining: number;
  overallProgress: number;
  goalCount: number;
  completedCount: number;
  emergencySaved: number;
  emergencyTarget: number;
  investmentSaved: number;
  investmentTarget: number;
  allocation: Array<{
    type: SavingGoalType;
    label: string;
    saved: number;
    target: number;
    share: number;
  }>;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toSavingGoalView(row: SavingGoalRow): SavingGoalView {
  const { type, name } = decodeGoalName(row.goal_name);
  const target = Number(row.target_amount);
  const saved = Number(row.saved_amount);
  const progress =
    target > 0 ? clampPercent((saved / target) * 100) : saved > 0 ? 100 : 0;
  const remaining = Math.max(0, target - saved);
  const isCompleted = saved >= target && target > 0;
  const isOverdue = Boolean(
    row.deadline && row.deadline < todayIso() && !isCompleted,
  );

  return {
    ...row,
    type,
    displayName: name,
    progress,
    remaining,
    isCompleted,
    isOverdue,
  };
}

export async function listSavingGoals(
  filters: SavingsFilters = {},
): Promise<{ rows: SavingGoalView[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { rows: [], error: "Not authenticated." };
  }

  let query = supabase
    .from("saving_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.q?.trim()) {
    query = query.ilike("goal_name", `%${filters.q.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: error.message };
  }

  let rows = (data ?? []).map(toSavingGoalView);

  if (filters.type && filters.type !== "all") {
    rows = rows.filter((row) => row.type === filters.type);
  }

  if (filters.status === "completed") {
    rows = rows.filter((row) => row.isCompleted);
  } else if (filters.status === "active") {
    rows = rows.filter((row) => !row.isCompleted);
  } else if (filters.status === "overdue") {
    rows = rows.filter((row) => row.isOverdue);
  }

  return { rows, error: null };
}

export function summarizeSavingGoals(rows: SavingGoalView[]): SavingsSummary {
  const totalTarget = rows.reduce((sum, row) => sum + Number(row.target_amount), 0);
  const totalSaved = rows.reduce((sum, row) => sum + Number(row.saved_amount), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress =
    totalTarget > 0
      ? clampPercent((totalSaved / totalTarget) * 100)
      : totalSaved > 0
        ? 100
        : 0;

  const byType: Record<
    SavingGoalType,
    { saved: number; target: number }
  > = {
    emergency: { saved: 0, target: 0 },
    goal: { saved: 0, target: 0 },
    investment: { saved: 0, target: 0 },
  };

  for (const row of rows) {
    byType[row.type].saved += Number(row.saved_amount);
    byType[row.type].target += Number(row.target_amount);
  }

  const labels: Record<SavingGoalType, string> = {
    emergency: "Emergency fund",
    goal: "Savings goals",
    investment: "Investments",
  };

  const allocation = (Object.keys(byType) as SavingGoalType[]).map((type) => ({
    type,
    label: labels[type],
    saved: byType[type].saved,
    target: byType[type].target,
    share:
      totalSaved > 0
        ? clampPercent((byType[type].saved / totalSaved) * 100)
        : 0,
  }));

  return {
    totalTarget,
    totalSaved,
    totalRemaining,
    overallProgress,
    goalCount: rows.length,
    completedCount: rows.filter((row) => row.isCompleted).length,
    emergencySaved: byType.emergency.saved,
    emergencyTarget: byType.emergency.target,
    investmentSaved: byType.investment.saved,
    investmentTarget: byType.investment.target,
    allocation,
  };
}
