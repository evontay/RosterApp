# MyCrew — "Sunny crew" visual style guide

Last verified: 2026-07-20 against `app/globals.css`

Warm cream canvas, white cards with soft amber borders, pill-shaped status
badges, emoji avatars, generous radii. Playfulness lives in avatars and pills —
layout stays disciplined so pay numbers and status counts remain scannable.

---

## 1. Tokens

**`app/globals.css` is the single source of truth for every hex value.** This
document describes patterns and rules only. Do not restate colour values here —
that duplication is what shipped three WCAG failures in July 2026.

Tokens are declared twice in `globals.css`: in `@theme` for Tailwind resolution,
and again as explicit classes in `@layer utilities` because Turbopack does not
reliably process `@theme`. **Adding a token means adding it in both places.**

| Group | Class prefixes | Used for |
|---|---|---|
| Surfaces | `bg-sun-page`, `bg-sun-card`, `bg-sun-inset` | canvas, cards, inset rows |
| Borders | `border-sun-border`, `border-sun-accent` | hairlines, focused inputs |
| Brand | `bg-sun-accent`, `bg-sun-accent-soft`, `text-sun-accent-text`, `text-sun-accent-link` | buttons, active nav, links, money |
| Text | `text-sun-ink`, `text-sun-body`, `text-sun-mute`, `text-sun-faint` | headings, body, metadata, hints |
| Status | `bg-status-{open,confirmed,logged,paid}-bg` + matching `-text` / `-dot` | badges, dots, calendar bars |
| Pending | `bg-pending-bg`, `text-pending-text`, `text-pending-mute`, `border-pending-border` | interest sent, waiting strips |
| Roles | `bg-role-{purple,blue,pink,green}-bg` + matching `-text` | role pills |
| Avatars | `bg-avatar-1` … `bg-avatar-5` | emoji avatar backgrounds |
| Alert | `bg-alert` | nav unread badge |
| Radii | `rounded-card` 16 / `rounded-tile` 12 / `rounded-cell` 10 / `rounded-full` | see hard rule 6 |

### Accessibility constraints (audited 2026-07-13)

These are not style preferences — they are the reason certain pairings exist.
Breaking them reintroduces known WCAG AA failures.

- **Text on `bg-sun-accent` is always `text-sun-ink`, never `text-white`.**
  White on amber is ~2.1:1 and fails. Dark ink is 6.8:1.
- `text-sun-mute` is deliberately darkened for 4.8:1 on white. Do not lighten it
  back toward a hint gray.
- `bg-alert` is deliberately darkened so white badge text passes at 4.8:1.
- Status `-dot` colours are for **decorative fills only** (dots, calendar bars).
  Never put text on a `-dot` background — all four fail AA.
- Decorative elements (status dots, `$` prefixes) get `aria-hidden="true"`.

---

## 2. Component recipes

### Page shell
```html
<div class="min-h-screen bg-sun-page px-5 py-5">
```

### Card (page-level)
```html
<div class="bg-sun-card border border-sun-border rounded-card p-4">
```

### Inset row (list item inside a card)
```html
<div class="bg-sun-inset rounded-tile px-3 py-2.5 flex items-center gap-2.5">
```

### Empty / placeholder slot (dashed pattern)
```html
<div class="border border-dashed border-sun-border rounded-tile px-3 py-2.5">
```
Used for: empty staffing slots, locked milestones, archived-shifts collapse row,
"browse open shifts" teaser, end-of-list messages. Avatar placeholder inside an
empty slot: dashed gray circle containing "?".

### Status badge
```html
<span class="bg-status-open-bg text-status-open-text text-[11px] px-2.5 py-1 rounded-full">Open</span>
```
Semantics — never deviate:

| Status (UI label) | Token family | Meaning |
|---|---|---|
| Open | red `status-open-*` | needs owner action |
| Confirmed | green `status-confirmed-*` | positive / staffed |
| Logged | blue `status-logged-*` | informational |
| Paid / money | amber `status-paid-*` | money-related |

Money amounts in running text always use `text-sun-accent-link`.

### Primary button — ONE per page maximum
```html
<button class="bg-sun-accent text-sun-ink text-xs font-medium px-4 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50">
  + New shift
</button>
```
Reserved for the single most important action: New shift, Express interest,
Create my crew, Join [Business]. Never `text-white` — see accessibility
constraints above.

### Secondary / outline button
```html
<button class="border border-sun-accent text-sun-accent-link text-xs px-3.5 py-1 rounded-full">
  I'm interested 🙋
</button>
```

### Quiet / destructive-adjacent button (Reject, Withdraw, Unassign)
Always visually quiet — gray outline, never red fill:
```html
<button class="border border-gray-200 text-sun-mute text-[11px] px-3 py-1 rounded-full">Reject</button>
```

### Confirm button (owner, shift detail)
The one green solid in the app. Uses a literal green rather than a status token
because it is an action, not a state. Keep text at `text-sm`+ or bold — white on
this green is ~3.8:1 and only passes AA at large-text sizes.

### Nav
```html
<nav class="flex items-center justify-between" aria-label="Main navigation">
  <span class="text-[17px] font-medium text-sun-ink">MyCrew <span class="text-sun-accent">☀</span></span>
  <!-- active -->
  <span class="bg-sun-accent-soft text-sun-accent-text px-3 py-1 rounded-full text-xs">Shifts</span>
  <!-- inactive -->
  <span class="text-sun-mute text-xs">Roster</span>
  <!-- unread badge -->
  <span class="bg-alert text-white text-[10px] px-1.5 rounded-full">4</span>
</nav>
```

### Emoji avatar
```html
<div class="w-8 h-8 rounded-full bg-avatar-1 flex items-center justify-center text-sm">🌸</div>
```
Background = deterministic hash of `partTimer.id` over `avatar-1..5`.
Stacked avatars (staffing strips): `border-2 border-white -ml-1.5` overlap;
unfilled slot = `border-2 border-dashed border-gray-300 bg-gray-50 text-sun-mute` with "?".

### Role pill (includes pay when in shift context)
```html
<span class="bg-role-purple-bg text-role-purple-text text-[11px] px-2.5 py-0.5 rounded-full">
  Facilitator · $25/hr
</span>
```

### Status stepper (shift detail)
Current step: solid status pill with `●` prefix. Future steps: dashed ghost —
`border border-dashed border-gray-200 text-sun-faint rounded-full`.
Connectors: 2px bars, `bg-sun-border` up to current, `bg-gray-100` after.

### Pending / waiting strip (interest sent)
```html
<div class="bg-pending-bg rounded-tile px-3 py-2 flex items-center justify-between">
  <span class="text-pending-text text-xs">You raised your hand · waiting for the boss</span>
  <button class="border border-pending-border text-pending-mute text-[11px] px-2.5 py-1 rounded-full">Withdraw</button>
</div>
```

### Metric card (dashboard)
```html
<div class="bg-sun-card border border-sun-border rounded-tile px-3.5 py-3">
  <div class="text-[11px] text-sun-mute">Active crew</div>
  <div class="text-[22px] font-medium text-sun-ink">8</div>
</div>
```

### Kudos card
```html
<div class="bg-sun-inset rounded-tile px-3 py-2.5">
  <p class="text-xs text-sun-body leading-relaxed">"Setup done 20 minutes early — lifesaver!"</p>
  <p class="text-[10px] text-sun-mute mt-1">Craft Workshop Co. · Weaving workshop · 28 Jun</p>
</div>
```

### Milestone pills
Unlocked: `bg-sun-accent-soft text-sun-accent-text rounded-full` with emoji.
Locked next: dashed gray pill + distance ("🎖 50 shifts · 23 to go").

### Calendar (shifts page)
- Day cell: `bg-sun-inset rounded-cell min-h-11 p-1`, date top-right `text-[11px] text-sun-body`
- Today: `bg-sun-accent-soft` cell, date `text-sun-accent-text font-medium`, tiny "today" label
- Selected day: same fill plus `border-[1.5px] border-sun-accent`
- Shift bar: `h-[7px] rounded-full` filled with the status **dot** colour
- Weekday header: single letters, muted amber
- Legend: colour dots + counts, right-aligned above calendar
- No placeholder bars on empty days; "tap a day to add" hint lives in the legend

### Form input
```html
<input class="w-full bg-sun-inset border border-sun-border rounded-cell px-3 py-2 text-sm
              focus:border-sun-accent focus:outline-none" />
```
Focused state is a 1.5px amber border — same visual language as the selected
calendar day. Every unlabelled input needs `aria-label`.

---

## 3. Voice and copy rules

- Warm, human, plain. "Raised hands" not "Pending interests" (owner UI);
  "You raised your hand · waiting for the boss" (employee side).
- Declines are free — make it visible in copy, not just enforced in code:
  - Open shifts subtitle: "interest is never a commitment until confirmed"
  - Owner footnote: "Rejecting sends a friendly note — it never affects their record."
- Emoji allowed in: avatars, milestone badges, primary CTA suffix (🙋), section
  headings sparingly (💛). Never in: status badges, pay amounts, error states.
- Empty states are invitations with 🌱, never apologies.
- Skill-match signal shown only when true: "matches your skills ✓".

---

## 4. Hard rules

1. One solid amber button per page. Everything else is outline or text.
2. Reject / Withdraw / Unassign are always gray and quiet — never red buttons.
3. Status colours are fixed semantics (see table) across badges, dots, calendar
   bars, and steppers. Never introduce a new colour for an existing status.
4. Money is always `text-sun-accent-link` in text, amber pill when a badge.
5. Owner sees performance data; employees never do — no score UI in
   employee-side components.
6. Radii: cards 16 / tiles 12 / cells 10 / pills full. Nothing sharp.
7. Never `text-white` on `bg-sun-accent`, and never text on a `-dot` colour.
