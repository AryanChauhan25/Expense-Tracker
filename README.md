# Personal Finance Manager

Full-stack expense tracker and monthly funds manager (Next.js + Supabase), built from `Personal_Finance_Manager_Cursor_Spec.md`.

## Status

- **Phase 1 — done:** Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, dark mode, Supabase SSR clients.
- **Phase 2 — done:** database schema, email/password auth, profile management, row-level security.
- **Phase 3 — done:** income module CRUD (salary, business, freelance, other) with filters and summaries.
- **Phase 4 — done:** expense module CRUD with categories, recurring and planned future expenses.
- **Phase 5 — done:** budget planner with monthly budgets, category limits and overspending alerts.
- **Phase 6 — done:** dashboard analytics, charts, financial health score and smart insights.
- **Phase 7 — done:** savings goals with emergency fund, investments, progress and contributions.
- **Phase 8 — done:** reports for daily/weekly/monthly/yearly/custom ranges with PDF and Excel export.

## Local development

```bash
npm install
copy env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Migrations live in `supabase/migrations`:

| Migration | Contents |
| --- | --- |
| `..._initial_schema.sql` | `users`, `income`, `expense_categories`, `expenses`, `monthly_budget`, `saving_goals`, generated `month`/`year` columns, `updated_at` triggers, profile-on-signup trigger, seeded default categories |
| `..._rls_policies.sql` | RLS enabled on every table with per-owner select/insert/update/delete policies |

Both migrations are applied to the live project. To push future ones:

```bash
npx supabase db push --db-url "postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Use the **pooler** host, not `db.<ref>.supabase.co` — the direct host resolves to IPv6 only and is unreachable from IPv4-only networks. URL-encode special characters in the password (`@` becomes `%40`).

After schema changes, update `types/database.ts` to match, or regenerate it (needs Docker):

```bash
npx supabase gen types typescript --db-url "<pooler-url>" --schema public > types/database.ts
```

## Architecture

```text
app/                  routes: (auth) sign in/up, (app) protected shell, /auth/callback
components/           layout shell, theme toggle, shadcn/ui primitives
features/<module>/    actions, queries and components per domain module
lib/                  supabase clients, env parsing, navigation, zod schemas
types/                database types and domain models
utils/                finance calculations
supabase/migrations/  SQL migrations
```

Auth is enforced in two places: `proxy.ts` refreshes the session and redirects unauthenticated visitors, and every protected page calls `requireProfile()` server-side before reading data.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Preventing Supabase pause (free tier)

Free Supabase projects pause after roughly a week of inactivity. This repo includes an external keep-alive (a paused project cannot wake itself):

1. **GitHub Actions** — `.github/workflows/supabase-keepalive.yml` runs every 3 days and pings Auth + REST.
2. **Vercel Cron** (after deploy) — `vercel.json` hits `/api/cron/keep-alive` on the same cadence.

### One-time setup

1. In the [Supabase dashboard](https://supabase.com/dashboard), **restore** the project if it is currently paused.
2. Add repository secrets (Settings → Secrets and variables → Actions):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Push these workflow files to `main`, then run **Actions → Supabase Keep-Alive → Run workflow** once to verify.
4. If you deploy to Vercel, also set `CRON_SECRET` in the Vercel project env and the same value is sent automatically by Vercel Cron.

Manual check (dev):

```bash
curl http://localhost:3000/api/cron/keep-alive
```
