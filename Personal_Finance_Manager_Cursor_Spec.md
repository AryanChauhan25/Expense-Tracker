# Personal Finance Manager -- Cursor Project Specification

## Project Goal

Build a modern full-stack **Personal Expense Tracker & Monthly Funds
Manager** using **Next.js (React)** and **Supabase**.

The application should help a single user: - Track income and
expenses. - Plan future monthly budgets. - Calculate spending
percentages. - Analyze spending habits. - Suggest savings. - Visualize
financial data with charts. - Be production-ready with clean
architecture.

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod
-   Recharts

## Backend

-   Supabase
-   PostgreSQL
-   Authentication
-   Row Level Security

## Deployment

-   Vercel + Supabase

------------------------------------------------------------------------

# Folder Structure

``` text
app/
components/
features/
  dashboard/
  income/
  expenses/
  budget/
  savings/
  reports/
lib/
hooks/
types/
utils/
supabase/
database/
```

------------------------------------------------------------------------

# Core Modules

## 1. Authentication

-   Login
-   Profile

## 2. Dashboard

Show: - Total Income - Total Expenses - Remaining Balance - Savings -
Budget Progress - Charts - Smart Insights

## 3. Income Module

CRUD for: - Salary - Business - Freelance - Other Income

## 4. Expense Module

CRUD with: - Title - Category - Amount - Date - Notes - Recurring
expenses - Planned future expenses

## 5. Budget Planner

-   Monthly budget
-   Category budgets
-   Remaining budget
-   Overspending alerts

## 6. Savings

-   Emergency fund
-   Savings goals
-   Investment allocation
-   Goal tracking

## 7. Reports

-   Daily
-   Weekly
-   Monthly
-   Yearly
-   Custom range
-   PDF & Excel export

------------------------------------------------------------------------

# Database Tables

## users

id, name, email, currency, created_at

## income

id, user_id, title, category, amount, month, year, date, notes

## expense_categories

id, name, color, icon, budget_percentage

## expenses

id, user_id, title, category_id, amount, expense_date, month, year,
is_recurring, notes

## monthly_budget

id, user_id, month, year, expected_income, planned_savings

## saving_goals

id, user_id, goal_name, target_amount, saved_amount, deadline

------------------------------------------------------------------------

# Required Calculations

-   Total Income
-   Total Expenses
-   Remaining Balance = Income - Expenses
-   Savings Rate = Savings / Income × 100
-   Expense Percentage = Expense / Income × 100
-   Category-wise spending %
-   Budget utilization %
-   Monthly trends

------------------------------------------------------------------------

# Charts

-   Pie: Expenses by category
-   Bar: Income vs Expenses
-   Line: Monthly trend
-   Area: Savings growth
-   Donut: Budget utilization
-   Heatmap: Daily spending

------------------------------------------------------------------------

# Smart Features

-   Auto-calculate savings suggestions.
-   Detect overspending.
-   Support recurring expenses.
-   Support future budget planning.
-   Financial health score.
-   Monthly AI-ready insights.

------------------------------------------------------------------------

# UI Requirements

Use: - Clean modern dashboard - Responsive layout - Dark mode - Cards,
tables, charts - Search & filters - Fast loading

------------------------------------------------------------------------

# Development Phases

## Phase 1

Project setup, Tailwind, shadcn/ui, Supabase.

## Phase 2

Database schema, authentication, RLS.

## Phase 3

Income module.

## Phase 4

Expense module.

## Phase 5

Budget planner.

## Phase 6

Dashboard analytics and charts.

## Phase 7

Savings goals.

## Phase 8

Reports and export.

## Phase 9

Optimization, testing, deployment.

------------------------------------------------------------------------

# Cursor Instructions

You are a Senior Full Stack Engineer.

Follow these rules:

1.  Build incrementally.
2.  Never leave TODOs.
3.  Create reusable components.
4.  Use TypeScript everywhere.
5.  Validate forms with Zod.
6.  Use React Hook Form.
7.  Keep code modular.
8.  Add loading, empty and error states.
9.  Follow clean architecture.
10. Create production-quality code.

Start with **Phase 1** only. After Phase 1 is complete, stop and wait
for confirmation before continuing to the next phase.
