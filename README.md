# Personal Finance Manager

Full-stack expense tracker and monthly funds manager (Next.js + Supabase), built from `Personal_Finance_Manager_Cursor_Spec.md`.

## Status

- **Phase 1 — done:** Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, dark mode, Supabase SSR clients.
- **Phase 2 — done:** database schema, email/password auth, profile management, row-level security.

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

## Next phase

**Phase 3:** income module CRUD (salary, business, freelance, other).
