import { budgetModuleMeta } from "@/features/budget/meta";
import { dashboardModuleMeta } from "@/features/dashboard/meta";
import { expensesModuleMeta } from "@/features/expenses/meta";
import { incomeModuleMeta } from "@/features/income/meta";
import { reportsModuleMeta } from "@/features/reports/meta";
import { savingsModuleMeta } from "@/features/savings/meta";

export const appModules = [
  dashboardModuleMeta,
  incomeModuleMeta,
  expensesModuleMeta,
  budgetModuleMeta,
  savingsModuleMeta,
  reportsModuleMeta,
] as const;

export type AppModule = (typeof appModules)[number];
