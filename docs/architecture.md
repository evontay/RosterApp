# MyCrew — architecture and operations

Slow-changing. Stack, landmines, and deploy procedure.

---

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database:** PostgreSQL — Postgres.app locally, Neon in production
- **ORM:** Prisma v7 with `@prisma/adapter-pg` driver adapter (no native engine)
- **Auth:** NextAuth.js v5 beta (Auth.js) — Credentials provider, JWT sessions
- **File storage:** Vercel Blob (public store) — business logo uploads
- **Hosting:** Vercel — `https://mycrew-dun.vercel.app`
- **Repo:** `https://github.com/evontay/RosterApp` (private)

⚠️ **Next.js 16 has breaking changes from earlier versions.** Read the relevant
guide in `node_modules/next/dist/docs/` before writing framework code. See
`AGENTS.md`.

---

## Prisma v7 landmines

- No bundled engine — requires `@prisma/adapter-pg` + `pg`.
- Client is instantiated with the adapter: `new PrismaClient({ adapter })`.
- Connection URL lives in `prisma.config.ts`, **not** in `schema.prisma`.
- Migrations run as manual SQL via `prisma migrate deploy` (the environment is
  non-interactive).
- **After any schema change:** kill the dev server → `npx prisma generate` →
  `rm -rf .next` → restart. Skipping this produces stale-type errors that look
  like unrelated bugs.

## Vercel Blob landmines

- Requires `BLOB_READ_WRITE_TOKEN` in `.env.local`.
- **Do not** set `BLOB_STORE_ID` locally — triggers OIDC mode and breaks dev.
- **Do not** set `VERCEL_OIDC_TOKEN` locally — same failure.
- Logo filenames include a timestamp (`logos/{id}-{timestamp}.ext`) to bust CDN
  cache on replace. The old blob is deleted on replace or remove.

## Tailwind v4 / Turbopack landmine

Turbopack does not reliably process `@theme`. Every design token is therefore
declared **twice** in `app/globals.css` — once in `@theme` for Tailwind
resolution, once as an explicit class in `@layer utilities`. Adding a token
means adding it in both places, or it silently fails to render.

---

## Commands

| Task | Command |
|---|---|
| Local dev | `npm run dev` → `http://localhost:3000` |
| Build | `npm run build` (runs `prisma generate` first) |
| Seed | `npm run db:seed` |
| Deploy | `vercel --prod --force` from project root |
| Migrate (local) | `npx prisma migrate dev --name <name>` |
| Migrate (prod) | `DATABASE_URL="<neon-url>" npx prisma migrate deploy` |

Local secrets live in `.env` / `.env.local` (gitignored). Production secrets are
managed via `vercel env add` or the Vercel dashboard.

---

## Seed accounts

| Role | Email | Password |
|---|---|---|
| Owner | owner@craftworkshop.com | password123 |
| Part-timer | sarah@example.com | password123 |
| Part-timer | james@example.com | password123 |

Applied to the production Neon DB on 2026-07-14. Re-seed with
`DATABASE_URL="<neon-url>" npx tsx prisma/seed.ts`.
