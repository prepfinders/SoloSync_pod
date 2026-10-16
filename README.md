# SoloSync Dashboard

Web dashboard for the data the **SoloSync** iOS app syncs to Supabase: gig sessions,
earnings, engaged time and mileage, expenses, scheduled gigs, adjustment pay, platforms and
vehicles. It also lets you **enter and edit** that data from a browser; anything you add here
flows back into the iOS app on its next cloud sync.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Recharts and `@supabase/ssr`.

## How it connects to the app

- Same Supabase project and **same user accounts** as the iOS app. Sign in with the email and
  password you use in the app. Row Level Security scopes every query to the signed-in user.
- Rows created or edited here are stamped with `device_id = "web-dashboard"` and a fresh
  `local_id`, which is what the app's `CloudSyncManager` uses to import remote changes.
- Metrics mirror the app: gross = base + tips; engaged miles = override or GPS miles;
  IRS deduction = deductible miles × $0.725; taxable income = gross − deduction − expenses −
  safety & admin fees. Dates are bucketed in the user's profile timezone.

## Pages

| Route | What it does |
|---|---|
| `/` | KPIs, earnings / miles / hours charts, platform breakdown, recent sessions, upcoming gigs. Filter by date range and platform. |
| `/sessions` | Paginated session list; `/sessions/new` logs a session manually; `/sessions/[id]` edits or deletes one and shows its breaks. |
| `/scheduled` | Upcoming, past, started and cancelled scheduled gigs; add and edit. |
| `/expenses` | Expense list and totals by type; add and edit. |
| `/adjustments` | Adjustment pay entries (guaranteed-earnings top-ups, bonuses); add and edit. |
| `/platforms`, `/vehicles` | Manage the platforms and vehicles sessions are assigned to. |
| `/settings` | Name, timezone, mileage reimbursement rate, energy cost, hourly target. |

## Run locally

```bash
cp .env.example .env.local   # already points at the SoloSync Supabase project
npm install
npm run dev                  # http://localhost:3000
```

`npm run build` runs the production build; `npm run lint` and `npx tsc --noEmit` check the code.

## Deploy

Deploy as a standard Next.js app (for example on Vercel). Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the host's
environment. The publishable key is safe to expose; RLS does the access control.

If you want to add Sign in with Apple on the web, configure an Apple Services ID in Supabase
Auth and add a button that calls `supabase.auth.signInWithOAuth({ provider: "apple" })`.
