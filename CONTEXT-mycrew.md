# MyCrew — Build Context for Claude Code

## What this app is

A private, invite-only roster management tool for small business owners who hire
part-timers directly (not an open marketplace). The first real use case is a craft
workshop business that hires facilitators and logistics/setup support for events.

Two user types:
- **Business Owner** — manages a closed roster of part-timers they've personally
  added, creates shifts, assigns people to slots, tracks hours and pay.
- **Part-Timer** — views their assigned shifts and pay, edits their profile/avatar.
  Only sees businesses they've been explicitly invited to.

This is **not** an open marketplace. Part-timers cannot browse or apply to jobs.

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
- After any schema change: kill dev server → `npx prisma generate` → `rm -rf .next` → restart

---

## Current state

### Owner-side features
- Auth (email + password login)
- **Roster**: invite, archive/restore members; avatar display; skills; availability; "Worked with" section on each profile
- **Shifts + Calendar**: combined two-column page (`/dashboard/shifts`) — list on left, 3-month scrollable calendar on right
  - Create/edit shifts from either panel
  - Sort by date (asc/desc)
  - Shift status: Open → Confirmed → Logged → Paid (labels consistent across all surfaces)
  - Auto-advance to "filled" when all slots staffed; revert to "open" on unassign
  - Archive paid shifts; cancelled shifts auto-archive; unarchive anytime
  - Cancelled shifts excluded from calendar view
- **Slot-based staffing**: each role on a shift has N slots; boss fills each slot by selecting an employee (manual) OR confirming an interested employee
- **Interest management**: shift detail shows pending interests with employee name (clickable → profile modal), comment, Confirm/Reject actions
- **Employee profile modal**: avatar, skills, completed job count, link to full roster profile
- **Hours + pay**: log hours per assignment, pay auto-calculated from role's pay type/rate
- **Mark as paid** per assignment or all at once
- **Dashboard**: active employees, shifts this month, status counts (open/confirmed/logged); "Needs attention" section (understaffed shifts, pending interests, unpaid employees); next 7 days upcoming shifts with staffing ratio
- **Settings → Role types**: create, rename, archive/restore; default pay type and rate per role

### Employee-side features
- Auth (email + password)
- **Home** (`/home`): avatar, profile info, skills, upcoming shifts
- **Open Shifts** (`/open-shifts`): all upcoming open shifts across active businesses; express interest with optional comment; withdraw if still pending
- **My Shifts** (`/my-shifts`): full assignment history, sort by date, clickable cards
- **Shift detail** (`/shifts/[id]`): shift info, assigned role, pay rate, payment status
- **Settings** (`/my-settings`): edit name, phone, avatar (emoji + background colour); availability preference per day (Morning/Afternoon/Flexible)

---

## Route structure

### Owner (`/dashboard/*`)
| Route | Description |
|-------|-------------|
| `/dashboard` | Dashboard — roster count, shift status summary |
| `/dashboard/roster` | Roster list with archive section |
| `/dashboard/roster/[id]` | Employee profile — skills, availability, pay summary, shift history, worked-with |
| `/dashboard/shifts` | Shifts list + calendar (combined two-column page) |
| `/dashboard/shifts/new` | Create shift form |
| `/dashboard/shifts/[id]` | Shift detail — staffing slots, hours logging, pay, actions menu |
| `/dashboard/calendar` | Redirects to `/dashboard/shifts` |
| `/dashboard/settings/roles` | Role type management |

### Employee (`/*`)
| Route | Description |
|-------|-------------|
| `/home` | Employee home — avatar, profile, skills, upcoming shifts |
| `/open-shifts` | All upcoming open shifts; express/withdraw interest |
| `/my-shifts` | All assigned shifts |
| `/shifts/[id]` | Shift detail — role, rate, pay amount, payment status |
| `/my-settings` | Profile + avatar editor + availability preferences |
| `/my-profile` | Redirects to `/my-settings` |

---

## Schema (current)

```prisma
model User {
  id         String     @id @default(cuid())
  email      String     @unique
  password   String
  role       UserRole
  createdAt  DateTime   @default(now())
  businesses Business[]
  partTimer  PartTimer?
}

model Business {
  id            String             @id @default(cuid())
  name          String
  ownerUserId   String
  createdAt     DateTime           @default(now())
  rosterMembers RosterMembership[]
  shifts        Shift[]
  partTimerSkills PartTimerSkill[]
}

model PartTimer {
  id           String             @id @default(cuid())
  userId       String             @unique
  name         String
  phone        String?
  email        String
  profilePhoto String?
  avatarEmoji  String?            -- emoji character or null (uses initials)
  avatarColor  String?            -- hex colour string, deterministic fallback from id
  createdAt    DateTime           @default(now())
  skills       PartTimerSkill[]
  availability Availability[]
  memberships  RosterMembership[]
  assignments  ShiftAssignment[]
}

model RosterMembership {
  id          String           @id @default(cuid())
  businessId  String
  partTimerId String
  invitedAt   DateTime         @default(now())
  status      MembershipStatus @default(invited)  -- invited | active | removed
  inviteToken String?          @unique
  @@unique([businessId, partTimerId])
}

model Skill {
  id             String           @id @default(cuid())
  label          String           @unique
  defaultPayType PayType?
  defaultPayRate Decimal?         @db.Decimal(10, 2)
  archived       Boolean          @default(false)
  partTimers     PartTimerSkill[]
  shiftRoles     ShiftRole[]
}

model PartTimerSkill {
  partTimerId String
  skillId     String
  businessId  String
  @@id([partTimerId, skillId, businessId])
}

model Availability {
  id          String                @id @default(cuid())
  partTimerId String
  dayOfWeek   DayOfWeek
  preference  AvailabilityPreference @default(flexible)
}

model Shift {
  id          String            @id @default(cuid())
  businessId  String
  title       String
  shiftDate   DateTime
  startTime   String
  endTime     String
  status      ShiftStatus       @default(open)   -- open | filled | completed | cancelled
  archived    Boolean           @default(false)
  createdAt   DateTime          @default(now())
  assignments ShiftAssignment[]
  roles       ShiftRole[]
}

model ShiftRole {
  id          String            @id @default(cuid())
  shiftId     String
  skillId     String
  count       Int               @default(1)
  payType     PayType
  payRate     Decimal           @db.Decimal(10, 2)
  assignments ShiftAssignment[] -- inverse relation: assignments filling this slot
}

model ShiftAssignment {
  id            String           @id @default(cuid())
  shiftId       String
  partTimerId   String
  shiftRoleId   String?          -- which role slot this assignment fills (null = legacy pre-slot)
  status        AssignmentStatus @default(assigned)
  hoursLogged   Decimal?         @db.Decimal(5, 2)
  payAmount     Decimal?         @db.Decimal(10, 2)
  paymentStatus PaymentStatus    @default(unpaid)
  paidAt        DateTime?
  createdAt     DateTime         @default(now())
}

model ShiftInterest {
  id          String         @id @default(cuid())
  shiftId     String
  shiftRoleId String?        -- null = general interest
  partTimerId String
  status      InterestStatus @default(pending)
  comment     String?
  createdAt   DateTime       @default(now())
  @@unique([shiftId, partTimerId, shiftRoleId])
}
```

### Enums
| Enum | Values |
|------|--------|
| `UserRole` | `owner`, `part_timer` |
| `MembershipStatus` | `invited`, `active`, `removed` |
| `ShiftStatus` | ~~`draft`~~ (DB only, unused), `open`, `filled`, `completed`, `cancelled` |
| `PayType` | `hourly`, `flat_session` |
| `AssignmentStatus` | `assigned`, `completed`, `cancelled` |
| `PaymentStatus` | `unpaid`, `paid` |
| `DayOfWeek` | `Mon`–`Sun` |
| `AvailabilityPreference` | `morning`, `afternoon`, `flexible` |
| `InterestStatus` | `pending`, `confirmed`, `rejected`, `withdrawn` |

---

## Key business logic

- **Slot-based assignment**: each `ShiftRole` has a `count` (slots). Boss fills slots one by one via manual assign OR by confirming a `ShiftInterest`. Each `ShiftAssignment` links to a `shiftRoleId`. Manual dropdown filtered to employees with matching skill.
- **One employee per shift**: an employee cannot fill two slots on the same shift.
- **Auto-advance status**: when all slots across all roles are filled → shift auto-advances to `filled`. Unassigning reverts `filled` → `open`. Confirming an interest also triggers this check.
- **Interest flow**: employees express interest in open shifts (with optional comment) via `/open-shifts`. Owner confirms (picks role) or rejects on the shift detail page. Confirming creates a `ShiftAssignment`. Employee can withdraw if still `pending`.
- **Interest uniqueness**: `@@unique([shiftId, partTimerId, shiftRoleId])` — one general interest per employee per shift (`shiftRoleId = null`).
- **Archive rules**: only fully-paid or cancelled shifts can be archived. Cancelled shifts auto-archive on cancellation.
- **Draft removed**: shifts are created as `open` by default. The `draft` enum value exists in the DB but is unused.
- **Status labels** (UI only, DB values unchanged): `open` → Open, `filled` → Confirmed, `completed` → Logged. Consistent across shift list badges, stepper, calendar legend, and dashboard.
- **Avatar**: employees pick an emoji (or use initials) + a pastel background colour. Fallback colour is deterministically hashed from the partTimer's `id`.

---

## Why this document exists

Phases 1 and 2 are complete. Later phases will add: an objective performance record, a private Trust Rating, milestone-based retention nudges, and a team-fit/pairing-notes layer.

**Do not build those yet** — but keep the schema extensible.

---

## Phase roadmap

### Phase 1 — complete ✅
Owner manages roster, creates shifts with per-role slots and pay, assigns part-timers to slots, logs hours, marks paid. Part-timer views their shifts. Combined shifts+calendar page. Avatar system. Archive patterns throughout.

### Phase 2 — complete ✅
Employees see all open shifts and express interest (with optional comment). Owner confirms or rejects from the shift detail page. Confirming creates a `ShiftAssignment` and auto-advances shift status. Employees can withdraw pending interest. Owner retains manual assign capability. Withdrawal after confirmation is out of scope.

### Phase 3
ObjectiveRecord, SubjectiveNote, TrustRating tables — scoped per business per part-timer. Trust Rating visible to owner only.

### Phase 4
Milestone detection, retention nudges, RewardLog. Rewards stay personal and owner-authored.

### Phase 5
Team-fit / pairing notes layer. Owner-customizable skill tags.

---

## Explicitly OUT of scope (do not build)

- Open marketplace / discovery — closed-roster only, permanently
- In-app payment processing — tracking only, reconciled externally
- Clock-in/clock-out — manual hours entry is sufficient
- Native mobile app — responsive web covers both surfaces

---

## Key design principles

1. **Closed roster, not a marketplace.** Enforce via `RosterMembership.status = 'active'` at the API level.
2. **Schema anticipates Phase 2-5 without building them.** Enums over booleans, separate tables, business-scoped records.
3. **No payment processing.** Tracks what's owed and marks paid manually.
4. **Multi-tenant from day one.** Every relevant table scoped by `businessId`.
5. **Declines are always free.** A decline must never reduce any score or visible standing — structural commitment, not just a rule.

---

## Seed accounts (local dev)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@craftworkshop.com | password123 |
| Part-timer | sarah@example.com | password123 |
| Part-timer | james@example.com | password123 |
