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
- **Production:** Vercel — `https://mycrew-dun.vercel.app`
- **Production DB:** Neon (PostgreSQL) — connection string stored in Vercel env vars

### Key Prisma v7 notes
- No bundled engine — requires `@prisma/adapter-pg` + `pg`
- Client instantiated with adapter: `new PrismaClient({ adapter })`
- After any schema change: kill dev server → `npx prisma generate` → `rm -rf .next` → restart

---

## Current state

### Marketing pages
- `/` — landing page: hero, trust bar, 3-step how-it-works summary, for-part-timers section, CTA
- `/how-it-works` — expanded 3-step page with alternating copy + product card layout
- `/for-part-timers` — dedicated page: hero, 3 benefit cards, joining flow, CTA
- Shared `MarketingNav` component (`components/MarketingNav.tsx`) with active state highlighting
- Unauthenticated visitors see the landing page; authenticated users are redirected to their respective dashboard
- "Start free" / "Build your crew — free" CTAs → `/signup`; "Log in" → `/login`

### Signup
- `/signup` — owner self-registration: name, business name, email, password (min 8 chars)
- `POST /api/auth/signup` creates `User` (role: owner) + `Business` in one transaction, then auto-signs in via NextAuth credentials
- Part-timers join via invite link only — no public signup path for them
- Login page has "Create an account" link → `/signup`; both pages have MyCrew logo linking back to `/`

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
- **Mark as paid** per assignment or all at once; **Unmark paid** per assignment if mistake
- **Shift status corrections**: "Unmark as logged" reverts a completed shift back to filled/open based on current slot count; "Mark as logged" is blocked before the shift date (UI grayed out + API guard)
- **Dashboard**: active employees, shifts this month, status counts (open/confirmed/logged); unread activity banner; "Needs attention" section (understaffed shifts, pending interests, unpaid employees); next 7 days upcoming shifts with staffing ratio
- **Activity feed** (`/dashboard/activity`): append-only event log grouped by date; badge count in nav; marks all read on visit
- **Settings → Role types**: create, rename, archive/restore; default pay type and rate per role
- **Settings → Performance tags**: create, rename, archive/restore owner-defined job-performance tags scoped per business
- **Performance records**: on completed shift detail, each assignment row shows Add/Edit record — attendance (attended/late/no-show), optional quality flag (good/issues), optional tags, optional private notes. Retroactively editable.
- **Trust signals on roster profile**: Performance section shows Reliability % and Quality %, both computed with 180-day exponential decay (recent shifts weighted more). Raw record count shown as context. Color-coded green ≥80 / yellow 60–79 / red <60. Quality shows "—" until at least one quality flag is set.
- **Performance log on roster profile**: below the score bars, a chronological log (newest first) of every ObjectiveRecord — shift name, date, attendance/quality badges, tags, and private notes if written. Visible to owner only, never to employee.
- **Kudos**: on a completed shift detail, each assigned employee has a "Send kudos" link below the performance record form. Owner writes a short message; upserted one per shift per employee. Employees see kudos in their home feed.
- **Owner profile** (`/dashboard/settings/profile`): owner sets display name, phone, business address, avatar (emoji + colour picker). Business name is editable here. Email is read-only. Avatar stored on `Business` model; shown in nav top-right (links to profile page). Also accessible via Settings → My profile dropdown.
- **Dashboard greeting**: time-aware — "Good morning" 5am–11:59am, "Hello" at all other times. Name resolved from `Business.ownerName` → email prefix fallback.

### Employee-side features
- Auth (email + password)
- **Home** (`/home`): avatar, profile info, skills, shift history stats (Shifts / Hours / Earned), milestone badges, kudos feed, upcoming shifts
- **Open Shifts** (`/open-shifts`): all upcoming open shifts across active businesses; express interest with optional comment; withdraw if still pending
- **My Shifts** (`/my-shifts`): full assignment history, sort by date, clickable cards
- **Shift detail** (`/shifts/[id]`): shift info, assigned role, pay rate, payment status
- **Activity feed** (`/activity`): notifications for interest confirmed/rejected, assigned, shift cancelled, paid, hours logged, kudos received; badge count in nav; marks all read on visit
- **Settings** (`/my-settings`): edit name, phone, avatar (emoji + background colour); skills (pill selector, applies across all active business memberships); availability preference per day (Morning/Afternoon/Flexible)

---

## Route structure

### Owner (`/dashboard/*`)
| Route | Description |
|-------|-------------|
| `/dashboard` | Dashboard — roster count, shift status summary, unread activity banner, needs attention, next 7 days |
| `/dashboard/roster` | Roster list with archive section |
| `/dashboard/roster/[id]` | Employee profile — skills, availability, pay summary, shift history, worked-with |
| `/dashboard/shifts` | Shifts list + calendar (combined two-column page) |
| `/dashboard/shifts/new` | Create shift form |
| `/dashboard/shifts/[id]` | Shift detail — staffing slots, hours logging, pay, actions menu |
| `/dashboard/activity` | Activity feed — interest received/withdrawn, grouped by date |
| `/dashboard/calendar` | Redirects to `/dashboard/shifts` |
| `/dashboard/settings/profile` | Owner profile — display name, avatar, phone, email, business address |
| `/dashboard/settings/roles` | Role type management |
| `/dashboard/settings/performance-tags` | Performance tag management |

### Employee (`/*`)
| Route | Description |
|-------|-------------|
| `/home` | Employee home — avatar, profile, stats, milestones, kudos feed, upcoming shifts |
| `/open-shifts` | All upcoming open shifts; express/withdraw interest |
| `/my-shifts` | All assigned shifts |
| `/shifts/[id]` | Shift detail — role, rate, pay amount, payment status |
| `/activity` | Activity feed — confirmed, rejected, assigned, cancelled, paid |
| `/my-settings` | Profile + avatar editor + skills + availability preferences |
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
  id              String             @id @default(cuid())
  name            String
  ownerUserId     String
  ownerName       String?            -- owner's display name (shown in nav + greeting)
  ownerPhone      String?
  avatarEmoji     String?
  avatarColor     String?
  businessAddress String?
  createdAt       DateTime           @default(now())
  rosterMembers   RosterMembership[]
  shifts          Shift[]
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

model ObjectiveRecord {
  id          String               @id @default(cuid())
  shiftId     String
  partTimerId String
  businessId  String
  attendance  Attendance           -- attended | late | no_show
  qualityFlag QualityFlag?         -- good | issues | null (unflagged)
  comment     String?              -- private owner notes, never shown to employee
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  tags        ObjectiveRecordTag[]
  @@unique([shiftId, partTimerId])
}

model PerformanceTag {
  id         String               @id @default(cuid())
  businessId String
  label      String
  archived   Boolean              @default(false)
  records    ObjectiveRecordTag[]
  @@unique([businessId, label])
}

model ObjectiveRecordTag {
  recordId String
  tagId    String
  @@id([recordId, tagId])
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

model Activity {
  id          String       @id @default(cuid())
  type        ActivityType
  recipientId String       -- userId (works for both owner and part-timer)
  entityType  String       -- "shift" | "assignment"
  entityId    String
  metadata    Json?        -- shiftTitle, shiftDate, partTimerName, payAmount
  read        Boolean      @default(false)
  createdAt   DateTime     @default(now())
}

model Kudos {
  id          String   @id @default(cuid())
  partTimerId String
  businessId  String
  shiftId     String
  message     String
  createdAt   DateTime @default(now())
  @@unique([shiftId, partTimerId])  -- one kudos per employee per shift, upsert on re-send
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
| `ActivityType` | `INTEREST_CONFIRMED`, `INTEREST_REJECTED`, `ASSIGNED`, `SHIFT_CANCELLED`, `PAID`, `INTEREST_RECEIVED`, `INTEREST_WITHDRAWN`, `HOURS_LOGGED`, `KUDOS_RECEIVED` |
| `Attendance` | `attended`, `late`, `no_show` |
| `QualityFlag` | `good`, `issues` |

---

## Key business logic

- **Slot-based assignment**: each `ShiftRole` has a `count` (slots). Boss fills slots one by one via manual assign OR by confirming a `ShiftInterest`. Each `ShiftAssignment` links to a `shiftRoleId`. Manual dropdown filtered to employees with matching skill.
- **One employee per shift**: an employee cannot fill two slots on the same shift. The assign API checks for any non-cancelled assignment (not just role-linked ones) to prevent duplicates after a shift edit.
- **Edit shift — role diffing**: the PUT `/api/shifts/[id]` route diffs new roles against existing ones by `skillId`. Matching roles are updated in-place (preserving assignment links). New skillIds create fresh roles. Removed skillIds null out their assignments' `shiftRoleId` before deletion. This ensures staffing is retained after an edit unless a role type is explicitly removed.
- **Orphaned assignments**: if a `ShiftAssignment` has `shiftRoleId: null` (left by a role deletion during edit) and the owner tries to re-assign the same employee, the API re-uses the orphaned record (updates it) rather than creating a duplicate.
- **Auto-advance status**: when all slots across all roles are filled → shift auto-advances to `filled`. Unassigning reverts `filled` → `open`. Confirming an interest also triggers this check.
- **Interest flow**: employees express interest in open shifts (with optional comment) via `/open-shifts`. Owner confirms (picks role) or rejects on the shift detail page. Confirming creates a `ShiftAssignment`. Employee can withdraw if still `pending`.
- **Interest uniqueness**: `@@unique([shiftId, partTimerId, shiftRoleId])` — one general interest per employee per shift (`shiftRoleId = null`).
- **Archive rules**: only fully-paid or cancelled shifts can be archived. Cancelled shifts auto-archive on cancellation.
- **Draft removed**: shifts are created as `open` by default. The `draft` enum value exists in the DB but is unused.
- **Status labels** (UI only, DB values unchanged): `open` → Open, `filled` → Confirmed, `completed` → Logged. Consistent across shift list badges, stepper, calendar legend, and dashboard.
- **Mark as logged gate**: cannot mark a shift as logged before its `shiftDate`. Enforced at the API level and grayed out in the UI.
- **Status corrections**: "Unmark as logged" recalculates status from slot fill state (→ `filled` if full, → `open` if not). "Unmark paid" per assignment reverts `paymentStatus` to `unpaid`. Both are owner-only.
- **Activity feed**: append-only `Activity` table, scoped by `recipientId` (userId). Written by API routes on key events. Nav badge shows unread count (server-rendered per request). Visiting the activity page marks all as read. Employee-side events: `ASSIGNED`, `INTEREST_CONFIRMED`, `INTEREST_REJECTED`, `SHIFT_CANCELLED`, `PAID`, `HOURS_LOGGED` (shows hours + pay amount), `KUDOS_RECEIVED` (shows message).
- **Employee skills**: employees set their own skills from Settings; applied across all active business memberships. Owner can also edit skills from the roster profile.
- **Nav**: "MyCrew" logo is the homepage link for both roles (owner → `/dashboard`, employee → `/home`). No separate Home/Dashboard nav item. Owner Settings is a hover dropdown with Role types and Performance tags.
- **Trust signals** (`lib/trust.ts`): `computeTrustSignals(records)` returns `{ reliability, quality, recordCount }`. Both scores use 180-day half-life exponential decay. Reliability counts all records; Quality counts only flagged ones. Returns `null` when no data exists for that signal. Scores are owner-only — never shown to employees.
- **Performance records**: declines and withdrawals never create ObjectiveRecords — only actual shift attendance.
- **Milestones** (`lib/milestones.ts`): `MILESTONES` array (7 badges) checked against `{ completedShifts, uniqueCoworkers }`. `computeMilestones(stats)` returns `{ unlocked, next }`. Computed on the fly from existing data — no separate table.
- **Kudos**: one per employee per shift (upsert). Written by owner on the shift detail page after completion. Employee sees them in a feed on their home page. Never negative — purely positive recognition.
- **Employee home stats**: computed from `ShiftAssignment` where status=completed — total shift count, total hours logged, total pay earned. Shown inline in the profile card once there's at least one completed shift.
- **Avatar**: employees pick an emoji (or use initials) + a pastel background colour. Fallback colour is deterministically hashed from the partTimer's `id`.

---

## Why this document exists

Phases 1–4 are complete. Phase 5 (team-fit / pairing notes) is next. Keep the schema extensible for multi-business support and richer analytics.

---

## Phase roadmap

### Phase 1 — complete ✅
Owner manages roster, creates shifts with per-role slots and pay, assigns part-timers to slots, logs hours, marks paid. Part-timer views their shifts. Combined shifts+calendar page. Avatar system. Archive patterns throughout.

### Phase 2 — complete ✅
Employees see all open shifts and express interest (with optional comment). Owner confirms or rejects from the shift detail page. Confirming creates a `ShiftAssignment` and auto-advances shift status. Employees can withdraw pending interest. Owner retains manual assign capability. Withdrawal after confirmation is out of scope.

### Post-Phase 2 additions — complete ✅
- Activity feed (owner + employee sides, badge counts, mark-as-read)
- Employee self-service skills editor in Settings
- Shift status corrections: unmark logged, unmark paid, date gate on Mark logged
- Nav: MyCrew logo as homepage link, removed redundant Home/Dashboard items

### Phase 3 — complete ✅
ObjectiveRecord per shift per employee (attendance + quality flag + tags + private notes). PerformanceTag vocabulary scoped per business, managed in Settings. Trust signals (Reliability %, Quality %) computed with recency weighting, displayed on roster profile (owner-only). Entry point is the completed shift detail page. Private notes shown in the performance log on the roster profile.

### Phase 4 — complete ✅
Gamification for employee motivation (no visible ratings). Three features built:
- **Milestone badges**: 7 milestones (first shift, 5/10/25/50 shifts, 3/10 unique teammates), computed from existing data, displayed as yellow pill badges on employee home. Next upcoming milestone shown as a prompt.
- **Shift history stats**: total completed shifts, total hours, total earned — inline in the profile card on employee home.
- **Kudos feed**: owner writes a short positive message per employee per shift (upsert) on the completed shift detail. Employee sees a feed on their home page. Purely positive — no negative mechanism.

### Phase 5
Team-fit / pairing notes layer. Owner-customizable skill tags.

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

## Accessibility & visual standards

### Colour tokens (globals.css)
All custom colours defined in `@theme` AND hardcoded in `@layer utilities` (Turbopack skips `@theme`).

| Token | Hex | Notes |
|-------|-----|-------|
| `sun-mute` | `#6B7280` | Darkened from #9CA3AF — passes WCAG AA (4.8:1 on white) |
| `sun-accent` | `#F59E0B` | Amber — buttons use `text-sun-ink` not `text-white` (dark text = 6.8:1) |
| `alert` | `#DC2626` | Darkened from #F87171 — nav badge passes WCAG AA (4.8:1 with white text) |

### WCAG AA status (last audited 2026-07-13)
- **All primary buttons**: `bg-sun-accent text-sun-ink` — dark text on amber (6.8:1 ✓)
- **Secondary/muted text** (`text-sun-mute`): 4.8:1 on white ✓
- **All status badges** (open/confirmed/logged/paid): 5.3–6.8:1 ✓
- **Role pills** (purple/blue/pink/green): 4.8–6.8:1 ✓
- **Nav unread badge** (`bg-alert text-white`): 4.8:1 ✓
- **Decorative elements** (status dots, `$` prefix): `aria-hidden="true"`

### Accessibility (last audited 2026-07-13)
- All modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and Escape-key handler
- All icon-only buttons have `aria-label`
- All unlabelled form inputs have `aria-label`
- Nav elements have `aria-label` (`"Dashboard navigation"` / `"Main navigation"`)
- Skip-to-content link in root layout targets `id="main-content"` on each layout's `<main>`

---

## Deployment workflow

- **Local dev:** `npm run dev` → `http://localhost:3000` (local Postgres via Postgres.app)
- **Deploy to prod:** `vercel --prod --force` from project root
- **Schema changes:** `npx prisma migrate dev --name <name>` (local) → `DATABASE_URL="<neon-url>" npx prisma migrate deploy` (production)
- **Env vars:** local secrets in `.env` (gitignored); production secrets managed via `vercel env add` or Vercel dashboard
- **Build script:** `prisma generate && next build` — `prisma generate` runs first to ensure Prisma client types are fresh on Vercel

---

## Seed accounts (local + production)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@craftworkshop.com | password123 |
| Part-timer | sarah@example.com | password123 |
| Part-timer | james@example.com | password123 |

Seed was applied to production Neon DB on 2026-07-14. To re-seed: `DATABASE_URL="<neon-url>" npx tsx prisma/seed.ts`
