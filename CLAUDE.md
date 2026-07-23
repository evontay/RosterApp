@AGENTS.md

# MyCrew

Invite-only roster tool for small business owners and their part-timers.
Next.js 16 · Prisma v7 · NextAuth v5 · Tailwind v4.

## Read before you work

| Doing this | Read |
|---|---|
| Scoping a feature, or unsure if something belongs | `docs/product.md` |
| Setting up, migrating, deploying, or debugging tooling | `docs/architecture.md` |
| Touching staffing, status, interest, scoring, or activity | `docs/domain-logic.md` + `prisma/schema.prisma` |
| Building or restyling any UI | `docs/design-system.md` + `visual design/` |
| Writing user-facing words | `docs/brand-copy.md` |
| Checking what already exists | `docs/state.md` |

`visual design/` holds approved HTML mockups. If a mockup exists for the surface
you're building, match it.

## Sources of truth — never duplicate these

- **Colour and radius values** → `app/globals.css`. `docs/design-system.md`
  describes patterns and names classes; it deliberately contains no hex values.
- **Data model** → `prisma/schema.prisma`. `docs/domain-logic.md` covers only
  rules the schema can't express.

Restating either one in a doc is how three WCAG failures shipped in July 2026.
When a doc and the code disagree, **the code wins** — fix the doc in the same
commit.

## Non-negotiables

1. **Closed roster, never a marketplace.** Part-timers cannot browse, apply, or
   self-register. Enforced at the API level, not just in the UI.
2. **Declines are free.** Declining or withdrawing must never affect any score
   or visible standing. No `ObjectiveRecord` is created for either.
3. **Recognition is loud, records are quiet.** Kudos and milestones are visible
   to part-timers. Reliability and quality scores are owner-only — never render
   them on an employee surface.
4. **Never `text-white` on `bg-sun-accent`.** Use `text-sun-ink`. White on amber
   fails WCAG AA.
5. **After any schema change:** kill dev server → `npx prisma generate` →
   `rm -rf .next` → restart.

## Docs hygiene

`docs/state.md` and `docs/design-system.md` carry "last verified" dates and are
expected to drift — update them when you change what they describe. The other
docs should rarely change; if you need to edit `docs/product.md`, that's a
product decision worth surfacing to the user rather than making silently.
