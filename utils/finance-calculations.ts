const DEFAULT_LOCALE = "en-IN";

export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function clampPercent(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function savingsRate(income: number, savings: number): number {
  if (income <= 0) {
    return 0;
  }
  return clampPercent((savings / income) * 100);
}

export function expenseShareOfIncome(income: number, expenses: number): number {
  if (income <= 0) {
    return 0;
  }
  return clampPercent((expenses / income) * 100);
}

export function remainingBalance(income: number, expenses: number): number {
  return income - expenses;
}

export function budgetUtilization(spent: number, limit: number): number {
  if (limit <= 0) {
    return spent > 0 ? 100 : 0;
  }
  return clampPercent((spent / limit) * 100);
}
