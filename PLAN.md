# Cortex Medical Scheduling System — Build Plan

**Stack:** NestJS + Prisma + MySQL · React (Vite) + Tailwind + React Query · npm workspaces monorepo · Docker Compose
**Deployment:** API + MySQL via Docker Compose on EC2 · Frontend on Vercel
**Budget:** ~11 hours across small, resumable tasks. Each task ends in a working, committable state.

## Repo Structure

```
cortex-scheduler/
├── apps/
│   ├── api/          # NestJS
│   └── web/          # React + Vite
├── packages/
│   └── shared/       # Zod schemas + types shared by both apps
├── docker-compose.yml        # dev: mysql only
├── docker-compose.prod.yml   # prod: mysql + api
├── CLAUDE.md
└── README.md
```

## Phase 0 — Foundation (~1h)

- [x] 0.1 Create GitHub repo `cortex-scheduler`, init npm workspaces (`"workspaces"` in root `package.json`)
- [x] 0.2 Scaffold `apps/api` (Nest CLI), `apps/web` (Vite react-ts), `packages/shared`; install `nestjs-zod` and register `ZodValidationPipe` as global `APP_PIPE` (replaces class-validator — one Zod schema drives validation, types, and Swagger)
- [x] 0.3 Shared tooling: strict `tsconfig` base, ESLint + Prettier, `.editorconfig`
- [x] 0.3b Configure `@/` → `src/` alias in web: `tsconfig.json` paths + `vite.config.ts` resolve.alias; create initial barrel `index.ts` files (`hooks`, `components/ui`, `lib`)
- [x] 0.4 Add `CLAUDE.md` (coding standards) to repo root
- [x] 0.5 `docker-compose.yml` with MySQL 8 + volume; `.env.example`
- [x] 0.6 First commit. CI stub: GitHub Action running `npm run lint && npm test` (workspace scripts)

## Phase 1 — Database & Schema (~1h)

- [ ] 1.1 Install Prisma in `apps/api`, connect to compose MySQL
- [ ] 1.2 Schema:
  - `User` (id, phone unique, name?, createdAt)
  - `OtpCode` (id, phone, codeHash, attempts, expiresAt, consumedAt?) — code stored hashed (node:crypto sha256), max 5 attempts
  - `RefreshToken` (id, userId, tokenHash, familyId, expiresAt, revokedAt?)
  - `Specialty` (id, name, description, icon, avgDurationMin)
  - `Doctor` (id, name, specialtyId, yearsExperience, rating, bio)
  - `DoctorAvailability` (id, doctorId, weekday, startTime, endTime) — stored clinic-local; converted to UTC per-date with Luxon + `CLINIC_TZ=Asia/Jerusalem` env (DST-safe)
  - `Appointment` (id, userId, doctorId, specialtyId, startsAt UTC, durationMin, status enum HELD | CONFIRMED | CANCELLED | COMPLETED, holdExpiresAt?, notes?)
  - Unique slot claim on Appointment → DB-level conflict prevention (a HELD row occupies the slot too)
- [ ] 1.3 Seed script with `prisma.upsert` (idempotent — safe to run twice): 6 specialties, 12 doctors, weekly availability
- [ ] 1.4 Write "Schema Decisions" section in README (UTC storage, unique constraint, status enum vs deletion)

## Phase 2 — Auth: OTP + Token System (~2h)

- [ ] 2.1 Zod DTOs in `packages/shared`: `RequestOtpSchema`, `VerifyOtpSchema`
- [ ] 2.2 `POST /auth/otp/request` — validate phone, create code (hash with node:crypto, store hash only); return plain code in response only when `NODE_ENV=development`, always log to console
- [ ] 2.3 `POST /auth/otp/verify` — check hash + expiry + attempts < 5 (increment on failure), upsert user → issue access JWT (15 min) in body + refresh token (7 d) as httpOnly cookie, hashed row in `RefreshToken`
- [ ] 2.4 `POST /auth/refresh` — validate cookie against hash, rotate: revoke old, issue new pair; reuse of a revoked token revokes the whole `familyId` (theft detection)
- [ ] 2.5 `POST /auth/logout` — revoke refresh token + clear cookie
- [ ] 2.6 JWT guard + `@CurrentUser()` decorator
- [ ] 2.7 `@nestjs/throttler` global guard + strict `@Throttle` override on both `/otp/request` and `/otp/verify` (e.g. 5/min per IP)
- [ ] 2.8 Vitest: OTP tests (expiry, reuse, wrong code) + refresh rotation/reuse-detection tests

## Phase 3 — Core API + Slot Holds (~2h)

- [ ] 3.1 `GET /specialties`
- [ ] 3.2 `GET /specialties/:id/doctors`
- [ ] 3.3 `GET /doctors/:id/slots?date=` — free slots = availability − (CONFIRMED + non-expired HELD); expired holds are treated as free (lazy expiry, no cron needed). Return UTC ISO strings
- [ ] 3.4 `POST /appointments/hold` — first re-validate `startsAt` is one of the currently computed free slots (reuse 3.3's function — closes the overlap gap; never trust client timestamps); then in one transaction: delete any expired HELD row on that `(doctorId, startsAt)`, insert HELD with `holdExpiresAt = now + 5 min`. Unique-constraint violation (P2002) → 409 "slot just taken"
- [ ] 3.5 `POST /appointments/:id/confirm` — verify ownership + `holdExpiresAt` not passed → status CONFIRMED; expired → 410 Gone
- [ ] 3.6 `DELETE /appointments/:id/hold` — release on user abandon (best-effort)
- [ ] 3.7 `GET /me/appointments?scope=upcoming|past` (excludes HELD)
- [ ] 3.8 `PATCH /appointments/:id/cancel` and `/reschedule` (reschedule = cancel + new hold/confirm in one transaction)
- [ ] 3.9 Global exception filter → consistent `{ error: { code, message } }` shape
- [ ] 3.10 Cheap wins: `@nestjs/swagger` at `/docs` (nestjs-zod auto-generates OpenAPI from your Zod DTOs — near-free), `@nestjs/terminus` `/health` endpoint (doubles as Docker healthcheck), `nestjs-pino` request logging
- [ ] 3.11 Vitest: slot computation (incl. expired-hold reclaim), hold race (two holds same slot), confirm-after-expiry, off-grid `startsAt` rejected

## Phase 4 — Frontend Foundation (~1h)

- [ ] 4.1 Tailwind config, design tokens (colors, spacing), base components: `Button`, `Input`, `Card`, `Spinner`, `Toast`
- [ ] 4.2 React Router: `/login`, `/dashboard`, `/book/*`, `/appointments`
- [ ] 4.3 React Query client + typed API layer consuming `packages/shared` schemas
- [ ] 4.4 Auth: access token in memory only; API client interceptor — on 401 call `/auth/refresh` once (`credentials: 'include'`) and retry; refresh failure → redirect to login. Protected route wrapper + silent refresh on app load

## Phase 5 — Login + Dashboard (~1.5h)

- [ ] 5.1 Login screen: phone input → OTP input (show dev code in UI banner)
- [ ] 5.2 Dashboard, new-user variant: welcome, CTA to book, specialties overview grid
- [ ] 5.3 Dashboard, returning-user variant: upcoming appointments, past history, quick actions (book / cancel / reschedule)
- [ ] 5.4 Loading skeletons + error states on every query

## Phase 6 — Booking Flow with Slot Holds (~2.5h)

- [ ] 6.1 Stepper shell with URL-driven steps (`/book/specialty` → `/book/doctor` → `/book/slot` → `/book/confirm`)
- [ ] 6.2 Step 1: specialty cards with details
- [ ] 6.3 Step 2: doctor cards (experience, rating)
- [ ] 6.4 Step 3: date picker + slot grid; convert UTC slots to user's local timezone for display. Selecting a slot calls `POST /appointments/hold` → on success go to confirm; on 409 show "just taken" toast + refresh slots
- [ ] 6.5 Step 4: confirmation summary with countdown timer ("Slot held for 4:32") from `holdExpiresAt` → confirm → success screen with toast. Timer hits zero → return to slot step with a friendly message
- [ ] 6.6 Release the hold (`DELETE .../hold`, best-effort) when the user goes back or leaves the confirm step
- [ ] 6.7 Handle 410 on confirm (hold expired mid-request) → refresh slots gracefully

## Phase 7 — Polish + One Extra Feature (~1h)

- [ ] 7.1 Extra feature: smart search — one input on dashboard searching doctors + specialties (single API endpoint, high impression-per-hour ratio)
- [ ] 7.2 Responsive pass (mobile-first is natural with Tailwind)
- [ ] 7.3 Empty states, final error-handling sweep

## Phase 8 — Deployment + README (~2h)

- [ ] 8.1 `Dockerfile` for API at repo root — multi-stage, monorepo-aware, base `node:20-slim` (Debian — avoids Prisma's Alpine/musl engine issues entirely):
  - Build stage: copy root `package*.json` + each workspace's `package.json` first (layer caching), then `npm ci`, then copy source and `npm run build -w packages/shared -w apps/api`
  - Runtime stage: only `apps/api/dist` + prod `node_modules` + Prisma client
  - CMD: `npx prisma migrate deploy && node dist/main.js` (migrations run automatically on boot)
  - `.dockerignore`: `node_modules`, `dist`, `.git`, `apps/web`
- [ ] 8.2 `docker-compose.prod.yml`: mysql + api (`build: { context: ., dockerfile: Dockerfile }`), healthchecks (api healthcheck hits `/health` from 3.10), restart policies, named volume; api waits on mysql healthcheck (`depends_on: condition: service_healthy`)
- [ ] 8.3 EC2: `git pull && docker compose -f docker-compose.prod.yml up -d --build`, then run seed once inside the api container
- [ ] 8.4 Frontend → Vercel: set Root Directory = `apps/web`, install command runs from repo root so `packages/shared` resolves
- [ ] 8.4b Same-origin via Vercel rewrite — in `vercel.json`: `{ "rewrites": [{ "source": "/api/:path*", "destination": "http://<EC2_HOST>/api/:path*" }] }`. The browser only ever talks to the Vercel domain, so the refresh cookie is first-party: `SameSite=Lax` works, Safari/ITP is a non-issue, no CORS config, no TLS/domain setup on EC2 needed. Frontend `VITE_API_URL=/api`
- [ ] 8.5 README: setup, architecture decisions, features, deployment, test credentials + demo flow
- [ ] 8.6 Optional: GitHub Action to SSH-deploy on push to `main` (you already have this pattern)

## Key Decisions to Document in README

1. MySQL over Mongo — appointments are relational; transactions + unique constraints give correctness for free
2. UTC everywhere in DB/API, localize only at render — answers their timezone requirement
3. Conflict prevention at 3 layers — UI (slots refresh), service (transaction), DB (unique constraint — a HELD row occupies the slot)
4. Slot-hold pattern — 5-min TTL reservation at confirm step (like ticketing sites); lazy expiry instead of a cron job keeps the system simple
5. Server re-validates every hold against computed slots — never trusts client timestamps; closes the overlap gap the unique constraint alone can't
6. Clinic-local availability + Luxon per-date conversion — DST-safe; UTC everywhere downstream
7. Vercel rewrite proxy — makes auth cookies first-party (Safari-proof) and eliminates CORS/TLS setup
8. Shared Zod schemas via nestjs-zod — one schema drives validation, TS types, and Swagger docs
9. Status enum instead of deleting appointments — preserves history for the "past appointments" view

## Scope Guardrails

- Doctor selection: implement it (it's cheap once schema exists) but keep doctor details minimal
- Skip: family members, reminders, medical history — mention them in README as "next steps" to show product thinking
- Mock OTP only — never pretend to send SMS
