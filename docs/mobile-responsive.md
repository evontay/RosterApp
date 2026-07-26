# MyCrew — mobile responsiveness audit

How to make the existing web app adapt from phone to desktop. Medium-changing.

Last verified: 2026-07-26. Shipped: globals.css shell fix, the owner/part-timer
bottom-tab-bar swap, all Tier 1 part-timer routes, and the owner Tier 2 easy
reflows (dashboard, roster, roster profile, new-shift form, RolesEditor).
Remaining: swap components 2-3 (FAB, bottom sheet) and the `/dashboard/shifts`
+ `/dashboard/shifts/[id]` swap — see "Suggested build order" below, steps 4-5.

Pairs with `docs/design-system.md` (unchanged by this work — the visual language
is size-independent) and `docs/state.md` (route inventory).

---

## Strategy

One responsive codebase, not a native app and not a separate mobile build. The
two user types have opposite mobile needs, and that sets priority:

- **Part-timers are phone-first** — they check shifts and pay on a phone.
  Their surfaces must be excellent at 375px.
- **Owners lean desktop** for staffing and pay runs, but glance at the dashboard
  on mobile. Their surfaces must be *unbroken* at 375px; they need not be
  optimised for it.

## Breakpoint model

Mobile-first Tailwind. Base classes describe the phone; `md:` (768px) adds the
desktop layout on top. One breakpoint does almost all the work; tablet takes the
desktop layout. The app is currently **desktop-first**, so most of this work is
inverting that default.

Two kinds of change, kept distinct:

- **Reflow** — cards and grids rearrange automatically with
  `grid-cols-1 md:grid-cols-2`. No bespoke components. Covers the majority.
- **Swap** — a handful of patterns render a *different component* by breakpoint,
  each a `hidden md:flex` / `md:hidden` pair. Same data, two presentations.

---

## The four swap components to build

These are shared and built once, then used across routes.

1. **Navigation.** Bottom tab bar below `md`, existing horizontal top nav at
   `md`+. Part-timer tabs: Home, Open shifts, My shifts, Activity, Me. Owner
   tabs: Home, Roster, Shifts, Activity, More (More holds Settings + archived).
   The activity unread badge rides its tab icon. Five tabs maximum.
2. **Primary action → FAB.** Where a page has one primary button in the header
   (`+ New shift`), that button becomes a floating action button bottom-right,
   above the tab bar, below `md`. Reuses the "one solid amber button per page"
   rule — the FAB *is* that button.
3. **Overlay → bottom sheet.** Centered modals (employee profile modal, pickers,
   confirm-role and manual-assign dropdowns) slide up from the bottom as sheets
   below `md`, with a drag handle. Native `<select>` already does this on iOS —
   prefer it for role/assignee pickers.
4. **Shifts page layout.** The two-column list + calendar becomes a
   `List | Calendar` segmented toggle below `md`; the 3-month scroll collapses to
   one month with prev/next (swipe), and tapping a day opens the day bottom
   sheet. Side-by-side returns at `md`+.

---

## globals.css fixes

`.site-nav-inner` and `.site-main` are hardcoded `width: 80vw`. On a phone that
wastes ~10% gutter each side and looks cramped. Change to full width with small
`px` padding on mobile, capping max width only at `md`+:

```css
/* was: width: 80vw */
width: 100%;
padding-inline: 1rem;      /* mobile */
/* at md+: max-width cap + auto margins */
```
Verify `<meta name="viewport" content="width=device-width, initial-scale=1">` is
present (Next.js default, but confirm). Keep input font ≥16px so iOS doesn't
auto-zoom on focus.

---

## Per-route audit

### Tier 1 — part-timers (mobile-first, do these well)

| Route | Reflow / swap | Notes |
|---|---|---|
| `/home` | reflow | Profile card + stat trio stack; kudos and upcoming shifts already vertical. Nearly free. |
| `/open-shifts` | reflow | Interest cards stack. Expand-to-comment stays inline; the express-interest button goes full-width. |
| `/my-shifts` | reflow | Card list, sort chip. Free. |
| `/activity` | reflow | Feed list. Free. |
| `/shifts/[id]` (employee) | reflow | Single-column detail already. Ensure pay/rate rows don't overflow. |
| `/my-settings` | reflow + swap | Avatar picker and skill pills reflow; day-availability grid goes single-column. Emoji/colour picker fine. |
| `/invite/[token]` | reflow | Already a narrow centred card — good on mobile as-is. Bump tap targets on emoji/skill pills. |

### Tier 0 — marketing + auth (first impressions, mostly reflow)

| Route | Reflow / swap | Notes |
|---|---|---|
| `/` , `/how-it-works` , `/for-part-timers` | reflow + swap | Two-column hero + alternating rows stack to single column; `MarketingNav` gets a mobile menu (hamburger or simple wrap). Collages stack. |
| `/login` , `/signup` | reflow | Centred cards already mobile-friendly. Confirm ≥16px inputs. |

### Tier 2 — owners (mobile-capable, nothing broken)

| Route | Reflow / swap | Notes |
|---|---|---|
| `/dashboard` | reflow | Metric cards `grid-cols-2 md:grid-cols-4`; needs-attention and next-7-days stack. |
| `/dashboard/shifts` | **swap (hardest)** | List/calendar toggle + one-month calendar + FAB. See swap component 4. Highest effort on the app. |
| `/dashboard/shifts/[id]` | swap | Staffing and raised-hands columns stack (staffing first). Status stepper collapses to connected dots with labels beneath. Confirm buttons go full-width, ~44px, bold (also fixes the `#059669` contrast at larger text). Profile modal → sheet. |
| `/dashboard/shifts/new` | reflow | Form single-column; role rows stack; pay inputs `inputmode="decimal"`. |
| `/dashboard/roster` | reflow | Member list + archived section. Free. |
| `/dashboard/roster/[id]` | reflow | Long profile scrolls; trust signals and performance log stack. Owner-only data stays owner-only (unchanged). |
| `/dashboard/activity` | reflow | Grouped feed. Free. |
| `/dashboard/settings/*` | reflow | Roles, tags, profile managers stack; tables → stacked rows, never horizontal scroll. |

---

## Touch + ergonomics checklist

- Interactive pills/buttons hit ~44×44px. Display-only pills (`py-0.5`) may stay
  small; anything tappable (skill toggles, status controls, sort chip) gets
  padding bumped on mobile.
- Primary actions live in the thumb zone — FAB or a sticky bottom bar, not the
  top-right corner.
- Number inputs (hours, pay) use `inputmode="decimal"`.
- Modals become bottom sheets; prefer native `<select>` for pickers.
- No horizontal scrolling except deliberately (none currently needed — reflow
  tables to cards instead).

## Test widths

375 (iPhone SE / mini), 390, 414 (large phones), 768 (breakpoint edge — verify
the swap flips cleanly), 1024+ (desktop). Check the `md` boundary in both
directions.

---

## Suggested build order

1. globals.css width fix + viewport/input-font check (unblocks everything).
2. Swap component 1 (navigation) — every route depends on it.
3. Tier 1 part-timer routes (mostly reflow — fast wins, highest-value audience).
4. Swap components 2–3 (FAB, bottom sheet) as their routes need them.
5. `/dashboard/shifts` swap (component 4) — the one hard screen, last.
6. Owner Tier 2 reflows alongside.

Optional follow-up: PWA touches (installable manifest, `standalone` display,
`theme-color`) to make the mobile web app feel native. No architecture change.
