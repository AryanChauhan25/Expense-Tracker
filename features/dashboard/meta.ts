export const dashboardModuleMeta = {
  id: "dashboard",
  label: "Dashboard",
  path: "/dashboard",
} as const;

export const DASHBOARD_CHARTS = [
  "expenses-by-category",
  "income-vs-expenses",
  "monthly-trend",
  "savings-growth",
  "budget-utilization",
  "daily-spending-heatmap",
] as const;
