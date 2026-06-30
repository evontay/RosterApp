# Roster App — Build Context for Claude Code

## What this app is

A private, invite-only roster management tool for small business owners who hire
part-timers directly (not an open marketplace). The first real use case is a craft
workshop business that hires facilitators and logistics/setup support for events.

Two user types:
- **Business Owner** — manages a closed roster of part-timers they've personally
  added, creates shifts, assigns people to them, tracks hours and pay.
- **Part-Timer** — accepts/declines shift offers, logs hours, views their own
  work history. Only sees businesses they've been explicitly invited to.

This is **not** an open marketplace. Part-timers cannot browse or apply to jobs —
they can only see and respond to offers from businesses that have added them to
their roster.

## Why this document exists

This is Phase 1 of a multi-phase build. Later phases will add: explicit-accept
shift flows with a richer status model, an objective performance record visible
to part-timers, a private "Trust Rating" visible only to owners, milestone-based
retention nudges, and a team-fit/pairing-notes layer for multi-person events.

**Phase 1 should NOT build those features yet** — but the schema should be
designed so they can be added later without painful migrations. Specifically:
the `ShiftAssignment` status field should be an enum (not a boolean), and table
structure should anticipate that `ObjectiveRecord`, `SubjectiveNote`, and
`TrustRating` will be added as related tables later, scoped per business per
part-timer. Don't build those tables yet — just don't paint the schema into a
corner that makes them awkward to bolt on.

## Phase 1 scope (build this now)

1. **Business** entity — the business owner's account/org.
2. **PartTimer** entity — a person who can be added to a business's roster.
3. **RosterMembership** — join table linking a PartTimer to a Business (invite-only,
   closed pool). A part-timer should only ever see data for businesses where they
   have an active membership.
4. **PartTimer profile** — name, contact info, skills (start with a simple fixed
   tag list, e.g. "facilitator", "logistics/setup", "front of house" — don't build
   owner-customizable tags yet), availability (simple recurring weekly pattern:
   day of week + start/end time, no exception calendar yet).
5. **Shift** entity — created by the owner: title, date, time, role needed (skill
   tag), pay type (hourly or flat session rate), pay rate, status.
6. **ShiftAssignment** — links a Shift to a PartTimer. For Phase 1, assignment is
   a **direct push** by the owner (not yet an offer requiring explicit accept —
   that's Phase 2). Status enum should still exist: `assigned`, `completed`,
   `cancelled`. Keep it simple but as an enum, not a boolean, so it's easy to
   extend later.
7. **Hours + pay tracking** — manual hours entry (no clock-in/out yet), pay
   auto-calculated from Shift.pay_type × hours (or flat amount for session-based
   shifts), and a manual "mark as paid" action. No payment processing — just
   tracking, to be reconciled against actual bank transfers outside the app.

## Explicitly OUT of scope for Phase 1 (do not build yet)

- Explicit accept/decline flow for shifts (Phase 2)
- ObjectiveRecord, SubjectiveNote, TrustRating, or any scoring/rating system
  (Phase 3)
- Milestone detection, retention nudges, RewardLog (Phase 4)
- Team-fit/pairing notes, owner-customizable tags (Phase 5)
- In-app payment processing (manual tracking only, indefinitely — this may never
  be built; payment stays a tracking/reconciliation feature)
- Clock-in/clock-out (manual hours entry is enough for Phase 1)
- Open marketplace / discovery features of any kind — this app is closed-roster
  only, permanently, by design

## Tech stack preferences

- Multi-tenant from day one: every relevant table should be scoped by
  `business_id`, even though there's currently only one real business using it.
  This is a hard requirement, not a nice-to-have — retrofitting tenancy later is
  expensive.
- A real backend with a proper database (Postgres preferred) and an API layer —
  not a no-code tool's data layer as the source of truth.
- Suggest a stack appropriate for a solo non-professional developer building with
  Claude Code: something like Next.js (App Router) + Postgres (e.g. via Supabase
  or a simple hosted Postgres) + an ORM (Prisma or Drizzle) is a reasonable
  default unless there's a strong reason to deviate — propose your recommended
  stack and explain the tradeoffs briefly before scaffolding, since I'm
  semi-technical and building this myself for the first time at this scope.
- Two distinct UI surfaces eventually (owner dashboard, part-timer mobile-first
  view) — for Phase 1, a responsive web app covering both is fine; native mobile
  is not needed yet.

### Local-first — no deployment yet

Keep everything fully local for now. No hosting, no deployed database, no
production deployment of any kind at this stage — that's a deliberate later step,
not part of this build.

- Run Postgres locally (e.g. via Docker Compose, or a local Postgres install —
  propose whichever is simpler to set up and explain the tradeoff briefly).
  Don't default to a hosted/cloud Postgres provider (e.g. Supabase, Neon, RDS)
  even though those are mentioned above as eventual options — for Phase 1,
  local-only.
- Auth should work locally without requiring a third-party hosted auth provider
  to be configured. A simple local auth implementation (e.g. NextAuth with a
  credentials provider, or an equivalent) is preferable to wiring up a hosted
  auth service right now.
- No environment variables pointing at production services, no deployment
  config (e.g. vercel.json, Dockerfile for prod) needs to be created yet — keep
  the setup focused on `npm run dev` (or equivalent) working cleanly on my
  machine.
- It's fine, and expected, that the architecture is chosen to be easy to deploy
  later (e.g. using Postgres rather than SQLite, since that transfers cleanly to
  a hosted Postgres down the line) — just don't actually set up or configure any
  deployment yet.
- Seed data: include a simple seed script so I can populate a test business,
  a few part-timers, and a couple of shifts locally without manually creating
  everything through the UI each time I reset the database.

## Data model reference (Phase 1 tables)

```
Business
  - business_id (PK)
  - name
  - owner_user_id (FK -> auth/user)
  - created_at

PartTimer
  - part_timer_id (PK)
  - name
  - phone
  - email
  - profile_photo (nullable)
  - created_at

RosterMembership
  - roster_membership_id (PK)
  - business_id (FK)
  - part_timer_id (FK)
  - invited_at
  - status (enum: invited / active / removed)

Skill
  - skill_id (PK)
  - label
  (fixed seed list for Phase 1: "Facilitator", "Logistics/Setup", "Front of House" —
  still model this as a proper table, not a hardcoded string list, so it's easy to
  expand later)

PartTimerSkill
  - part_timer_id (FK)
  - skill_id (FK)

Availability
  - availability_id (PK)
  - part_timer_id (FK)
  - day_of_week (enum: Mon-Sun)
  - start_time
  - end_time

Shift
  - shift_id (PK)
  - business_id (FK)
  - title
  - shift_date
  - start_time
  - end_time
  - role_needed (FK -> skill_id)
  - pay_type (enum: hourly / flat_session)
  - pay_rate (decimal)
  - status (enum: draft / open / filled / completed / cancelled)

ShiftAssignment
  - assignment_id (PK)
  - shift_id (FK)
  - part_timer_id (FK)
  - status (enum: assigned / completed / cancelled)  -- keep as enum, expect more
    values to be added in Phase 2 (offered, accepted, declined, cancelled_early,
    cancelled_late, no_show)
  - hours_logged (decimal, nullable until entered)
  - pay_amount (decimal, calculated)
  - payment_status (enum: unpaid / paid)
  - paid_at (timestamp, nullable)
  - created_at
```

## Key design principles to respect throughout

1. **Closed roster, not a marketplace.** A part-timer should never be able to see
   or be matched with a business they haven't been explicitly invited by. Enforce
   this at the query/API level via `RosterMembership.status = 'active'`, not just
   in the UI.
2. **Schema should anticipate Phase 2-5 without building them.** Use enums over
   booleans, separate tables over flattened fields, and business-scoped records
   over global ones, so later phases are additive rather than migrations that
   touch existing data.
3. **No payment processing.** This app tracks what's owed and marks it paid
   manually. Do not integrate Stripe/PayNow/etc. unless explicitly asked later.
4. **I am semi-technical, building this myself with Claude Code.** Explain
   architectural decisions briefly as you make them (a sentence or two, not an
   essay) so I understand what's being built and why, especially around anything
   that would be expensive to undo later (schema choices, auth approach, hosting).

## First build instruction

Please:
1. Propose a concrete tech stack (with brief reasoning) based on the preferences
   above.
2. Scaffold the project structure.
3. Set up the database schema for the Phase 1 tables listed above, including the
   `business_id` scoping on every relevant table.
4. Build basic auth (owner login at minimum; part-timer login can use a simple
   invite-link-based flow for now).
5. Build the core owner flows: create a shift, view roster, invite a part-timer,
   assign a part-timer to a shift, enter hours, mark as paid.
6. Build the core part-timer flows: view profile (edit skills/availability), view
   assigned shifts.

Confirm the stack and schema with me before scaffolding if anything above is
ambiguous or if you'd recommend a meaningfully different approach.
