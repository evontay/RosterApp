# MyCrew — domain logic

Rules the schema cannot express. Medium-changing.

**The schema itself lives in `prisma/schema.prisma` — that file is the source of
truth for models, fields, and enums.** Do not restate it here; read it directly.

---

## Staffing

**Slot-based assignment.** Each `ShiftRole` has a `count` (number of slots). The
owner fills slots one at a time, either by manual assignment or by confirming a
`ShiftInterest`. Each `ShiftAssignment` links to a `shiftRoleId`. The manual
assign dropdown is filtered to employees holding the matching skill.

**One employee per shift.** An employee cannot fill two slots on the same shift.
The assign API checks for any non-cancelled assignment — not just role-linked
ones — to prevent duplicates after a shift edit.

**Auto-advance status.** When every slot across all roles is filled, the shift
advances to `filled`. Unassigning reverts `filled` → `open`. Confirming an
interest also triggers this check.

**Edit shift — role diffing.** `PUT /api/shifts/[id]` diffs new roles against
existing ones by `skillId`. Matching roles are updated in place, preserving
assignment links. New skillIds create fresh roles. Removed skillIds null out
their assignments' `shiftRoleId` before deletion. Staffing survives an edit
unless a role type is explicitly removed.

**Orphaned assignments.** If a `ShiftAssignment` has `shiftRoleId: null` (left
by a role deletion during an edit) and the owner re-assigns the same employee,
the API re-uses the orphaned record rather than creating a duplicate.

---

## Interest flow

Employees express interest in open shifts, with an optional comment, from
`/open-shifts`. The owner confirms (choosing a role) or rejects on the shift
detail page. Confirming creates a `ShiftAssignment`. Employees may withdraw
while still `pending`.

Uniqueness is `@@unique([shiftId, partTimerId, shiftRoleId])` — one general
interest per employee per shift, with `shiftRoleId = null`.

**Declines and withdrawals never create `ObjectiveRecord` rows.** This is the
enforcement point for design principle 5.

---

## Status model

DB values and UI labels differ. **DB:** `open`, `filled`, `completed`,
`cancelled` (plus unused legacy `draft`). **UI:** Open → Confirmed → Logged →
Paid. Labels must stay consistent across list badges, steppers, calendar
legends, and the dashboard.

- **Mark as logged gate:** a shift cannot be marked logged before its
  `shiftDate`. Enforced in the API and grayed out in the UI.
- **Status corrections:** "Unmark as logged" recalculates status from slot fill
  state (`filled` if full, else `open`). "Unmark paid" reverts an assignment's
  `paymentStatus` to `unpaid`. Both owner-only.
- **Archive rules:** only fully-paid or cancelled shifts can be archived.
  Cancelled shifts auto-archive; anything can be unarchived. Cancelled shifts
  are excluded from the calendar.
- **Draft is dead:** shifts are created as `open`. The enum value remains in the
  DB but is unused.

---

## Scoring and recognition

**Trust signals** (`lib/trust.ts`) — `computeTrustSignals(records)` returns
`{ reliability, quality, recordCount }`. Both use 180-day half-life exponential
decay, so recent shifts weigh more. Reliability counts all records; Quality
counts only flagged ones. Returns `null` when there's no data for that signal.
**Owner-only — never rendered on an employee surface.**

**Performance records** — one `ObjectiveRecord` per shift per employee:
attendance (attended / late / no-show), optional quality flag, optional tags,
optional private notes. Retroactively editable. Notes are never shown to the
employee.

**Milestones** (`lib/milestones.ts`) — a `MILESTONES` array of 7 badges checked
against `{ completedShifts, uniqueCoworkers }`. `computeMilestones(stats)`
returns `{ unlocked, next }`. Computed on the fly; no table.

**Kudos** — one per employee per shift (upsert). Written by the owner on a
completed shift; shown in the employee's home feed. Purely positive by design —
there is no negative counterpart, deliberately.

**Employee home stats** — computed from `ShiftAssignment` where
`status = completed`: shift count, hours logged, pay earned. Shown once at least
one shift is complete.

---

## Activity feed

Append-only `Activity` table scoped by `recipientId` (a userId, which works for
both roles). Written by API routes on key events. The nav badge shows unread
count, server-rendered per request; visiting the feed marks all read.

- **Owner events:** `INTEREST_RECEIVED`, `INTEREST_WITHDRAWN`
- **Employee events:** `ASSIGNED`, `INTEREST_CONFIRMED`, `INTEREST_REJECTED`,
  `SHIFT_CANCELLED`, `PAID`, `HOURS_LOGGED`, `KUDOS_RECEIVED`

---

## Profiles

**Employee skills** are self-set in Settings and apply across all active
memberships. Owners can also edit skills from the roster profile.

**Avatars** — an emoji (or initials fallback) plus a pastel background colour.
The fallback colour is deterministically hashed from the `PartTimer.id`, so a
member without preferences still looks intentional.

**Owner profile** — display name, phone, business address, avatar, and business
logo live on the `Business` model. The avatar appears in the nav top-right.

**Nav** — the "MyCrew" logo is the home link for both roles (owner →
`/dashboard`, employee → `/home`). There is no separate Home nav item.
