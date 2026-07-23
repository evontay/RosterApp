# MyCrew — product definition

Durable. If this file changes, something fundamental has changed.

---

## What this app is

A private, invite-only roster management tool for small business owners who hire
part-timers directly. The first real use case is a craft workshop business that
hires facilitators and logistics/setup support for events.

Positioning is motivation, not logistics: **"Turn part-timers into your A-team."**
The product's job is to make good part-timers want to come back — kudos,
milestones, and private reliability signals — not merely to fill slots.

## Two user types

**Business owner** — manages a closed roster of part-timers they personally
added, creates shifts, assigns people to slots, tracks hours and pay, records
private performance notes.

**Part-timer** — views assigned shifts and pay, expresses interest in open
shifts, edits their own profile and avatar. Only ever sees businesses they were
explicitly invited to.

This is **not** an open marketplace. Part-timers cannot browse or apply to jobs
outside the businesses that invited them, and cannot self-register.

---

## Design principles

1. **Closed roster, not a marketplace.** Enforced via
   `RosterMembership.status = 'active'` at the API level, not just in the UI.
2. **Schema anticipates future phases without building them.** Enums over
   booleans, separate tables, business-scoped records.
3. **No payment processing.** Track what's owed, mark paid manually.
4. **Multi-tenant from day one.** Every relevant table scoped by `businessId`.
5. **Declines are always free.** A decline or withdrawal must never reduce any
   score or visible standing. This is a structural commitment: declines and
   withdrawals never create `ObjectiveRecord` rows. Surface it in copy too — the
   promise is worthless if users can't see it.
6. **Recognition is loud, records are quiet.** Kudos and milestones are visible
   to the part-timer. Reliability and quality scores are owner-only, forever.
   No score UI may leak into employee-side components.

---

## Explicitly out of scope — do not build

- **Open marketplace / discovery** — closed-roster only, permanently
- **In-app payment processing** — tracking only, reconciled externally
- **Clock-in / clock-out** — manual hours entry is sufficient
- **Native mobile app** — responsive web covers both surfaces
- **Public ratings or star scores** — contradicts principle 6

Each of these is a deliberate product decision, not a backlog item. They appear
as selling points in `brand-copy.md`.
