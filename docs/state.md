# MyCrew — current state

**Volatile by design.** This is the file that goes stale. Everything here
describes what exists right now; nothing here is a commitment.

Last verified: 2026-07-20

---

## Phase status

| Phase | Status | Scope |
|---|---|---|
| 1 | ✅ complete | Roster, shifts with per-role slots and pay, assignment, hours, mark paid, combined shifts+calendar page, avatars, archive patterns |
| 2 | ✅ complete | Open shifts, express/withdraw interest, owner confirm/reject, auto-advance |
| 3 | ✅ complete | ObjectiveRecord, performance tags, trust signals on roster profile |
| 4 | ✅ complete | Milestones, shift history stats, kudos feed |
| — | ✅ complete | Marketing site, auth pages, invite acceptance, Sunny crew visual system, WCAG AA audit, owner profile + logo upload |
| 5 | next | Team-fit / pairing notes layer. Owner-customizable skill tags. |

---

## Shipped surfaces

### Marketing
`/` landing (hero, trust bar, 3-step summary, part-timer section, CTA) ·
`/how-it-works` (alternating copy + product cards) · `/for-part-timers` (hero,
benefit cards, joining flow). Shared `components/MarketingNav.tsx` with active
state. Unauthenticated visitors land here; authenticated users redirect to their
dashboard.

### Auth
`/login` · `/signup` (owner-only; creates `User` + `Business` in one transaction
via `POST /api/auth/signup`, then auto-signs in) · `/invite/[token]` (part-timer
onboarding: basics, avatar picker, skills — `POST /api/invite/accept` saves all
of it alongside password and membership activation).

Part-timers have no public signup path. Invite link only.

### Owner (`/dashboard/*`)

| Route | Purpose |
|---|---|
| `/dashboard` | Time-aware greeting, roster count, status summary, unread banner, needs-attention, next 7 days |
| `/dashboard/roster` | Roster list + archived section |
| `/dashboard/roster/[id]` | Profile — skills, availability, pay summary, history, worked-with, trust signals, performance log |
| `/dashboard/shifts` | Shifts list + 3-month calendar, two columns |
| `/dashboard/shifts/new` | Create shift |
| `/dashboard/shifts/[id]` | Staffing slots, interests, hours, pay, performance records, kudos |
| `/dashboard/activity` | Activity feed grouped by date |
| `/dashboard/calendar` | Redirects to `/dashboard/shifts` |
| `/dashboard/settings/profile` | Owner profile, avatar, business logo upload |
| `/dashboard/settings/roles` | Role types + default pay |
| `/dashboard/settings/performance-tags` | Performance tag vocabulary |

### Employee

| Route | Purpose |
|---|---|
| `/home` | Avatar, profile, stats, milestones, kudos feed, upcoming shifts |
| `/open-shifts` | Open shifts across active businesses; express/withdraw interest |
| `/my-shifts` | Assignment history |
| `/shifts/[id]` | Shift detail — role, rate, pay, payment status |
| `/activity` | Notifications |
| `/my-settings` | Profile, avatar, skills, availability |
| `/my-profile` | Redirects to `/my-settings` |

---

## Accessibility status

Last audited 2026-07-13; contrast regression on three auth buttons found and
fixed 2026-07-20.

- All primary buttons use `bg-sun-accent text-sun-ink` (6.8:1)
- Muted text, status badges, role pills, nav badge all pass AA
- Modals have `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape handler
- Icon-only buttons and unlabelled inputs have `aria-label`
- Skip-to-content link targets `id="main-content"` in each layout

**Known open issue:** selected-state toggles in
`app/dashboard/shifts/[id]/ObjectiveRecordForm.tsx` use white text on
`status-*-dot` backgrounds (1.9–2.8:1, fails AA). The two `#059669` Confirm
buttons in `InterestActions.tsx` and `AssignForm.tsx` are 3.8:1 — below AA for
their current `text-xs` size.
