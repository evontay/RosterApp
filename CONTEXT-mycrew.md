# MyCrew — Build Context for Claude Code

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

---

## Tech stack (as built)

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL via Postgres.app (local)
- **ORM:** Prisma v7 with `@prisma/adapter-pg` driver adapter (no native engine)
- **Auth:** NextAuth.js v5 beta (Auth.js) — Credentials provider, JWT sessions
- **Prisma config:** URL lives in `prisma.config.ts`, not in `schema.prisma`
- **Migrations:** Manual SQL via `prisma migrate deploy` (non-interactive env)
- **GitHub:** `https://github.com/evontay/RosterApp` (private)

### Key Prisma v7 notes
- No bundled engine — requires `@prisma/adapter-pg` + `pg`
- Client instantiated with adapter: `new PrismaClient({ adapter })`
- `DATABASE_URL` set in `prisma.config.ts` under `datasource.url`, not in `schema.prisma`
- After any schema change: kill dev server → `npx prisma generate` → restart

---

## Current state (Phase 1 — complete)

### Features built
- Owner auth (email + password login)
- Part-timer auth (email + password)
- Business + roster management (invite, activate, remove members)
- Shift creation, editing, status management
- Multi-role shifts (each role has its own skill, headcount, pay type, pay rate)
- Shift assignment (assign/unassign part-timers to shifts)
- Hours logging + pay calculation per assignment
- Mark as paid
- Year calendar view (AM/PM slots, click to create/edit shifts)
- Part-timer shift view (`/my-shifts`)
- Settings → Role types (rename, delete, set default pay type/rate)

### Role (Skill) management
- Skills are defined globally (not per-business in Phase 1)
- Each skill can have a `defaultPayType` and `defaultPayRate` — pre-fills when
  selected in shift creation
- New custom roles can be created inline from the shift form
- Rename/delete is in Settings → Role types (delete blocked if skill is in use)

---

## Entity Relationship Diagram (current schema)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           MyCrew ERD                                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────────┐
│     User     │          │     Business     │
│──────────────│          │──────────────────│
│ id (PK)      │ 1      * │ id (PK)          │
│ email        │◄─────────│ ownerUserId (FK) │
│ password     │          │ name             │
│ role         │          │ createdAt        │
│ createdAt    │          └────────┬─────────┘
└──────┬───────┘                   │
       │ 1                         │ 1
       │                           │
       │ 0..1                      │ *
┌──────▼───────┐          ┌────────▼─────────┐
│  PartTimer   │          │     Shift        │
│──────────────│          │──────────────────│
│ id (PK)      │          │ id (PK)          │
│ userId (FK)  │          │ businessId (FK)  │
│ name         │          │ title            │
│ email        │          │ shiftDate        │
│ phone        │          │ startTime        │
│ profilePhoto │          │ endTime          │
│ createdAt    │          │ status           │
└──┬──┬──┬────┘          └──────┬──┬────────┘
   │  │  │                      │  │
   │  │  │                      │  │
   │  │  │ *              *     │  │ *
   │  │  │   ┌──────────────────┘  │
   │  │  │   │                     │
   │  │  │   ▼                     ▼
   │  │  │  ┌──────────────┐  ┌────────────────────┐
   │  │  │  │  ShiftRole   │  │  ShiftAssignment   │
   │  │  │  │──────────────│  │────────────────────│
   │  │  │  │ id (PK)      │  │ id (PK)            │
   │  │  │  │ shiftId (FK) │  │ shiftId (FK)       │
   │  │  │  │ skillId (FK) │  │ partTimerId (FK)   │
   │  │  │  │ count        │  │ status             │
   │  │  │  │ payType      │  │ hoursLogged        │
   │  │  │  │ payRate      │  │ payAmount          │
   │  │  │  └──────┬───────┘  │ paymentStatus      │
   │  │  │         │          │ paidAt             │
   │  │  │       * │          └────────────────────┘
   │  │  │         │                   ▲
   │  │  │ *    1  ▼                   │ *
   │  │  └──►┌──────────────┐          │
   │  │       │    Skill     │      PartTimer (above)
   │  │       │──────────────│
   │  │       │ id (PK)      │
   │  │       │ label        │
   │  │       │ defaultPayType│
   │  │       │ defaultPayRate│
   │  │       └──────────────┘
   │  │
   │  │ *
   │  └──────────────────────────────────┐
   │                                     ▼
   │ *                        ┌────────────────────┐
   └─────────────────────────►│  RosterMembership  │
                               │────────────────────│
                               │ id (PK)            │
                               │ businessId (FK)    │◄── Business
                               │ partTimerId (FK)   │
                               │ status             │
                               │ inviteToken        │
                               │ invitedAt          │
                               └────────────────────┘
   │ *
   ├──► PartTimerSkill (partTimerId FK + skillId FK) ──► Skill
   │
   └──► Availability (partTimerId FK, dayOfWeek, startTime, endTime)
```

### Enums
| Enum | Values |
|------|--------|
| `UserRole` | `owner`, `part_timer` |
| `MembershipStatus` | `invited`, `active`, `removed` |
| `ShiftStatus` | `draft`, `open`, `filled`, `completed`, `cancelled` |
| `PayType` | `hourly`, `flat_session` |
| `AssignmentStatus` | `assigned`, `completed`, `cancelled` |
| `PaymentStatus` | `unpaid`, `paid` |
| `DayOfWeek` | `Mon`–`Sun` |

---

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

---

## Competitive positioning (context, not a build requirement)

This app is designed to be complementary to, not competitive with, StaffAny
(a Singapore-built workforce management SaaS for F&B/retail/logistics). This
matters for understanding *why* certain design choices in this document are
the way they are — it's background, not something to build against directly.

StaffAny is built for businesses with an ongoing, employed hourly workforce,
solving time-theft, payroll accuracy, and multi-outlet compliance problems.
It includes a retention/rewards add-on called EngageAny — gamified challenges
(shifts worked, punctuality, hours, sales targets) redeemable for a coin-based
reward catalogue, integrated with their payroll module.

This app solves a different problem: helping a small business owner with a
small, personally-known, closed pool of part-timers decide *who to staff next*
based on trust and fit — not motivate an existing employed workforce toward
output targets. The following principles keep that distinction real as the
app grows past Phase 1, and should be respected in all future phases even
though most aren't relevant to Phase 1's build itself:

1. **Declines are always free, permanently.** A part-timer declining a shift
   offer must never reduce any score, rating, or visible standing — in this
   phase or any future phase. This is a structural commitment, not just a
   scoring rule (see Phase 2+ status model below).
2. **Trust signals exist to inform staffing decisions, not as a detached
   points/rewards economy.** Any future scoring or reward feature should
   trace back to "does this help the owner decide who to call next," not
   become gamification for its own sake.
3. **Rewards (Phase 4+) should stay personal and owner-authored** (e.g. "first
   pick for next job," a manually-given bonus, a written shoutout) rather than
   evolving into an automated points-redeemable-for-catalogue-items system.
   This is a deliberate contrast with EngageAny's model, not an oversight to
   fix later.
4. **The team-fit/pairing layer (Phase 5) and the closed-roster model are the
   clearest points of difference** from anything StaffAny offers — protect
   these rather than diluting them in favor of more generic scheduling
   features.
5. **Always support clean, structured data export** (PartTimer profiles,
   skills, availability, objective shift history) so a business that outgrows
   this app can take their roster data with them. Don't build this against
   any specific external system's schema — just keep this app's own data
   model clean, portable, and not locked in.

---

## Phase roadmap

### Phase 1 — complete ✅
Owner manages roster, creates shifts with per-role pay, assigns part-timers,
logs hours, marks paid. Part-timer views their shifts. Year calendar view.
Settings for role type management.

### Phase 2 — next
Explicit accept/decline flow for shifts. Richer `ShiftAssignment` status:
`offered`, `accepted`, `declined`, `cancelled_early`, `cancelled_late`,
`no_show`. **Declines must never factor into any scoring/rating logic.**

### Phase 3
ObjectiveRecord, SubjectiveNote, TrustRating tables — scoped per business per
part-timer. Trust Rating visible to owner only.

### Phase 4
Milestone detection, retention nudges, RewardLog. Rewards stay personal and
owner-authored — no automated points-catalogue system.

### Phase 5
Team-fit / pairing notes layer. Owner-customizable skill tags.

---

## Explicitly OUT of scope (do not build)

- Open marketplace / discovery — closed-roster only, permanently, by design
- In-app payment processing — tracking only, reconciled externally
- Clock-in/clock-out — manual hours entry is sufficient
- Native mobile app — responsive web covers both surfaces for now

---

## Key design principles

1. **Closed roster, not a marketplace.** Enforce via `RosterMembership.status = 'active'`
   at the API level, not just the UI.
2. **Schema anticipates Phase 2-5 without building them.** Enums over booleans,
   separate tables over flattened fields, business-scoped records.
3. **No payment processing.** Tracks what's owed and marks paid manually.
4. **Multi-tenant from day one.** Every relevant table scoped by `businessId`.
5. **See "Competitive positioning" above** for product principles that guide
   Phase 2+ (declines stay free, trust signals inform decisions, rewards stay
   personal).

---

## Seed accounts (local dev)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@craftworkshop.com | password123 |
| Part-timer | sarah@example.com | password123 |
| Part-timer | james@example.com | password123 |
