# MyCrew — "Sunny crew" visual style guide for Claude Code

Apply this style across all MyCrew surfaces. Warm cream canvas, white cards with
soft amber borders, pill-shaped status badges, emoji avatars, generous radii.
Playfulness lives in avatars and pills — layout stays disciplined so pay numbers
and status counts remain scannable.

---

## 1. Design tokens

### Tailwind v4 (`globals.css`)

```css
@theme {
  /* Canvas + surfaces */
  --color-sun-page: #FFFBF2;      /* page background (cream) */
  --color-sun-card: #FFFFFF;      /* card surface */
  --color-sun-inset: #FFFBF2;     /* inset panels inside white cards */
  --color-sun-border: #FDE8C8;    /* card + input borders (soft amber) */

  /* Brand accent (amber) */
  --color-sun-accent: #F59E0B;        /* primary buttons, logo sun */
  --color-sun-accent-soft: #FEF3C7;   /* active nav pill, milestone pills */
  --color-sun-accent-text: #92400E;   /* text on accent-soft */
  --color-sun-accent-link: #B45309;   /* links, "View →" affordances, money */

  /* Text */
  --color-sun-ink: #1F2937;       /* headings, primary text */
  --color-sun-body: #4B5563;      /* body copy */
  --color-sun-mute: #9CA3AF;      /* metadata, timestamps */
  --color-sun-faint: #D1D5DB;     /* disabled, hints */

  /* Status — Open (needs action) */
  --color-status-open-bg: #FEE2E2;
  --color-status-open-text: #B91C1C;
  --color-status-open-dot: #F87171;

  /* Status — Confirmed (positive) */
  --color-status-confirmed-bg: #D1FAE5;
  --color-status-confirmed-text: #065F46;
  --color-status-confirmed-dot: #34D399;

  /* Status — Logged (informational) */
  --color-status-logged-bg: #DBEAFE;
  --color-status-logged-text: #1D4ED8;
  --color-status-logged-dot: #60A5FA;

  /* Status — Paid / money */
  --color-status-paid-bg: #FEF3C7;
  --color-status-paid-text: #92400E;

  /* Pending / waiting (interest sent, hourglass strips) */
  --color-pending-bg: #FEF9C3;
  --color-pending-text: #713F12;
  --color-pending-mute: #A16207;
  --color-pending-border: #FDE047;

  /* Role pill palette (cycle by role, stable per role id) */
  --color-role-purple-bg: #F3E8FF;  --color-role-purple-text: #7C3AED;
  --color-role-blue-bg:   #DBEAFE;  --color-role-blue-text:   #1D4ED8;
  --color-role-pink-bg:   #FCE7F3;  --color-role-pink-text:   #BE185D;
  --color-role-green-bg:  #D1FAE5;  --color-role-green-text:  #065F46;

  /* Avatar pastel backgrounds (deterministic hash from partTimer id) */
  --color-avatar-1: #DBEAFE;  /* blue */
  --color-avatar-2: #E9D5FF;  /* purple */
  --color-avatar-3: #FDE68A;  /* amber */
  --color-avatar-4: #FCE7F3;  /* pink */
  --color-avatar-5: #D1FAE5;  /* green */

  /* Radii */
  --radius-card: 16px;     /* page-level cards */
  --radius-tile: 12px;     /* inset rows, kudos cards, icon tiles */
  --radius-cell: 10px;     /* calendar day cells, small tiles */
  --radius-pill: 9999px;   /* all badges, buttons, nav items */

  /* Alert red (activity badge count) */
  --color-alert: #F87171;
}
```

### Tailwind v3 (`tailwind.config.ts`) — same values

```ts
extend: {
  colors: {
    sun: { page:'#FFFBF2', card:'#FFFFFF', border:'#FDE8C8',
           accent:'#F59E0B', 'accent-soft':'#FEF3C7', 'accent-text':'#92400E',
           link:'#B45309', ink:'#1F2937', body:'#4B5563', mute:'#9CA3AF', faint:'#D1D5DB' },
    status: {
      'open-bg':'#FEE2E2','open-text':'#B91C1C','open-dot':'#F87171',
      'confirmed-bg':'#D1FAE5','confirmed-text':'#065F46','confirmed-dot':'#34D399',
      'logged-bg':'#DBEAFE','logged-text':'#1D4ED8','logged-dot':'#60A5FA',
      'paid-bg':'#FEF3C7','paid-text':'#92400E',
    },
    pending: { bg:'#FEF9C3', text:'#713F12', mute:'#A16207', border:'#FDE047' },
  },
  borderRadius: { card:'16px', tile:'12px', cell:'10px' },
}
```

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
| Status (UI label) | bg / text | Meaning |
|---|---|---|
| Open | red `open-*` | needs owner action |
| Confirmed | green `confirmed-*` | positive / staffed |
| Logged | blue `logged-*` | informational |
| Paid / money | amber `paid-*` | money-related |
Money amounts in text always use `text-sun-link` (#B45309).

### Primary button — ONE per page maximum
```html
<button class="bg-sun-accent text-white text-xs font-medium px-4 py-1.5 rounded-full">
  + New shift
</button>
```
Reserved for the single most important action: New shift, Express interest,
Confirm (owner uses solid green `#059669` for Confirm — the one exception).

### Secondary / outline button
```html
<button class="border border-sun-accent text-sun-link text-xs px-3.5 py-1 rounded-full">
  I'm interested 🙋
</button>
```

### Quiet / destructive-adjacent button (Reject, Withdraw, Unassign)
Always visually quiet — gray outline, never red fill:
```html
<button class="border border-gray-200 text-sun-mute text-[11px] px-3 py-1 rounded-full">Reject</button>
```

### Nav
```html
<nav class="flex items-center justify-between">
  <span class="text-[17px] font-medium text-sun-ink">MyCrew <span class="text-sun-accent">☀</span></span>
  <!-- active item -->
  <span class="bg-sun-accent-soft text-sun-accent-text px-3 py-1 rounded-full text-xs">Shifts</span>
  <!-- inactive item -->
  <span class="text-sun-mute text-xs">Roster</span>
  <!-- unread badge -->
  <span class="bg-alert text-white text-[10px] px-1.5 rounded-full">4</span>
</nav>
```

### Emoji avatar
```html
<div class="w-8 h-8 rounded-full bg-avatar-1 flex items-center justify-center text-sm">🌸</div>
```
Background = deterministic hash of `partTimer.id` over avatar-1..5.
Stacked avatars (staffing strips): `border-2 border-white -ml-1.5` overlap;
unfilled slot = `border-2 border-dashed border-gray-300 bg-gray-50 text-sun-mute` with "?".

### Role pill (always includes pay when in context)
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
- Day cell: `bg-sun-inset rounded-cell min-h-11 p-1` , date number top-right `text-[11px] text-sun-body`
- Today: `bg-sun-accent-soft` cell, date `text-sun-accent-text font-medium`, tiny "today" label
- Shift bar: `h-[7px] rounded-full` colored with the status **dot** color (`status-*-dot`)
- Weekday header: single letters, `text-[10px] text-[#C4A876]`
- Legend: colored dots + counts, right-aligned above calendar
- No placeholder bars on empty days; "tap a day to add" hint in legend

---

## 3. Voice and copy rules

- Warm, human, lowercase-energy. "Raised hands" not "Pending interests" (owner UI).
  "You raised your hand · waiting for the boss" (employee side).
- Declines are free — make it visible in copy, not just code:
  - Open shifts subtitle: "interest is never a commitment until confirmed"
  - Owner footnote: "Rejecting sends a friendly note — it never affects their record."
- Emoji allowed in: avatars, milestone badges, primary CTA suffix (🙋), section
  headings sparingly (💛). Never in: status badges, pay amounts, error states.
- Empty states are invitations with 🌱, never apologies.
- Skill-match signal shown only when true: "matches your skills ✓".

## 4. Hard rules

1. One solid amber button per page. Everything else is outline or text.
2. Reject/Withdraw/Unassign are always gray and quiet — never red buttons.
3. Status colors are fixed semantics (see table) across badges, dots, calendar
   bars, and stepper. Never introduce a new color for an existing status.
4. Money is always `#B45309` in text, amber pill when a badge.
5. Owner sees performance data; employee never does — no score UI leaks into
   employee-side components.
6. Radii: cards 16 / tiles 12 / cells 10 / pills full. Nothing sharp.
