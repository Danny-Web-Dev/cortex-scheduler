# Cortex Scheduler

A medical appointment scheduling system. Patients authenticate by phone OTP, browse specialties and doctors, and book appointments against doctor availability using a **slot-hold reservation flow** that makes double-booking impossible — the same pattern ticketing sites use to reserve seats.

```
Patient ──► OTP login ──► pick specialty ──► pick doctor ──► pick slot ──► HOLD (5 min) ──► CONFIRM
```

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack & Why Each Tool](#tech-stack--why-each-tool)
- [How the Core Mechanisms Work](#how-the-core-mechanisms-work)
  - [Auth: OTP + rotating refresh tokens](#auth-otp--rotating-refresh-tokens)
  - [Booking: hold → confirm with lazy expiry](#booking-hold--confirm-with-lazy-expiry)
  - [Time: UTC everywhere, timezone at the edges](#time-utc-everywhere-timezone-at-the-edges)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Testing (Postman / newman)](#api-testing-postman--newman)
- [Automated Tests](#automated-tests)
- [Project Structure](#project-structure)
- [Schema Decisions](#schema-decisions)
- [Data Model](#data-model)
- [Scripts Reference](#scripts-reference)
- [Roadmap](#roadmap)

---

## Features

- **Passwordless phone auth** — request an OTP, verify it, get a session. New phone numbers are registered on the fly.
- **Hardened sessions** — 15-minute access JWTs in memory, 7-day refresh tokens in an httpOnly cookie, rotated on every refresh, with token-theft detection via family revocation.
- **Doctor catalog** — browse by specialty, full-text search across doctors and specialties.
- **Live slot computation** — free slots are computed on demand from weekly clinic-local availability windows, never pre-generated.
- **Two-phase booking** — a slot is *held* for 5 minutes (giving the patient time to confirm) before it's *confirmed*. Holds expire lazily; no cron jobs anywhere.
- **Appointment management** — reschedule, cancel, release a hold, view upcoming and past appointments.
- **Interactive API docs** — Swagger UI generated from the same Zod schemas that validate requests.

## Architecture

**Monorepo (npm workspaces)** — one repo, three packages, one `npm install`:

```
cortex-scheduler/
├── apps/api          NestJS + Prisma + MySQL     — the backend
├── apps/web          React + Vite + Tailwind     — the frontend
└── packages/shared   Zod schemas + types          — the contract both sides import
```

`packages/shared` is the single source of truth for the API contract: every request/response shape and error code is a Zod schema defined once and imported by **both** the API (for runtime validation + Swagger generation) and the web app (for response parsing + TypeScript types). The two apps literally cannot drift apart.

**The API is layered by technical responsibility**, with a strict one-direction flow:

```
HTTP ──► controllers ──► services ──► repositories ──► Prisma ──► MySQL
              │              │
           (guards,       (domain
            DTOs)        exceptions)
```

- **Controllers** declare routes, apply guards, call exactly one service method. No logic.
- **Services** own all business logic and throw *domain* exceptions (`SlotTakenException`, not `HttpException`) — a global exception filter maps them to HTTP responses with stable error codes.
- **Repositories** are the only place Prisma queries live; each accepts an optional transaction executor so services can compose multi-step writes atomically.

**The frontend follows "components render, hooks think":** server state lives entirely in React Query, business logic in custom hooks (`useHoldCountdown`, `useSilentRefresh`), and components stay under ~100 lines of pure JSX. In dev, Vite proxies `/api` to the backend so the browser talks to a single origin — same-origin requests, a first-party refresh cookie, zero CORS — mirroring the production rewrite setup.

## Tech Stack & Why Each Tool

### Backend (`apps/api`)

| Tool | Why it's here |
| --- | --- |
| **[NestJS](https://nestjs.com/) 11** | Opinionated structure (modules, DI, guards, filters) that makes the layered architecture *enforceable*, not aspirational. Dependency injection keeps services testable without touching the network or DB. |
| **[Prisma](https://www.prisma.io/) 5** | Type-safe database access — every query is checked against the schema at compile time. Migrations, seeding, and interactive transactions (used for hold/confirm atomicity) come built in. |
| **[MySQL](https://www.mysql.com/) 8.4** | Battle-tested relational store. Its unique-index semantics (unlimited `NULL`s in a unique column) are load-bearing for the `slotKey` double-booking guard — see [Schema Decisions](#schema-decisions). |
| **[Zod](https://zod.dev/) 4** | Runtime validation at every boundary: request DTOs, env vars at bootstrap (fail fast on missing config), and API responses on the frontend. One schema → validation + TypeScript type + Swagger doc. |
| **[nestjs-zod](https://github.com/BenLorantfy/nestjs-zod)** | The bridge that turns shared Zod schemas into NestJS DTO classes and OpenAPI definitions — so validation and docs are generated from the contract instead of duplicated by hand. |
| **[@nestjs/jwt](https://docs.nestjs.com/security/authentication)** | Signs and verifies the short-lived access JWTs. Stateless verification per request; no DB lookup on the hot path. |
| **[@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)** | Rate-limits the OTP endpoints so codes can't be brute-forced or spammed to a phone number. |
| **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** | Serves interactive API docs at `/docs`, generated from the Zod DTOs — always in sync with the actual validation. |
| **[@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)** | Standardized `/health` endpoint with a real DB connectivity check — what a load balancer or uptime monitor should probe. |
| **[Luxon](https://moment.github.io/luxon/)** | The one place timezone math happens on the server: converting clinic-local weekly availability (`"09:00"–"13:00"`, Asia/Jerusalem) into concrete UTC instants per date, DST-safely. |
| **[nestjs-pino](https://github.com/iamolegga/nestjs-pino) + pino** | Structured JSON request logging with near-zero overhead; `pino-pretty` makes it human-readable in dev. |
| **[cookie-parser](https://github.com/expressjs/cookie-parser)** | Reads the httpOnly refresh-token cookie on `/auth/refresh` and `/auth/logout`. |
| **node:crypto** (built-in) | SHA-256 hashing of OTP codes and refresh tokens before storage, and timing-safe comparison — no plaintext secrets ever hit the database. |

### Frontend (`apps/web`)

| Tool | Why it's here |
| --- | --- |
| **[React](https://react.dev/) 19** | Component model fits the wizard-style booking flow (specialty → doctor → slot → confirm) naturally. |
| **[Vite](https://vite.dev/) 8** | Instant dev server with HMR, and the dev proxy that gives the app its same-origin `/api` setup. |
| **[TanStack React Query](https://tanstack.com/query) 5** | Owns *all* server state — caching, revalidation, loading/error states, and mutation-driven invalidation. No server data ever lands in `useState` or context. |
| **[React Router](https://reactrouter.com/) 7** | Client-side routing with auth-aware route guards (`ProtectedRoute`, `PublicOnlyRoute`). |
| **[Tailwind CSS](https://tailwindcss.com/) 4** | Utility-first styling with zero UI-kit dependency — all shared primitives are custom-built in `components/ui/`. |
| **Zod** (again) | Parses every API response at the boundary, so a backend contract change fails loudly in dev instead of silently rendering `undefined`. |

### Shared / tooling

| Tool | Why it's here |
| --- | --- |
| **TypeScript 5 (strict)** | Everywhere. No `any`, no `@ts-ignore`, no non-null assertions — enforced by config and convention. |
| **npm workspaces** | Monorepo glue with no extra tooling: one lockfile, `@cortex/shared` resolved locally, per-workspace scripts via `-w`. |
| **[Vitest](https://vitest.dev/) 4** | Fast unit tests for the API (slot engine, auth, tokens, booking conflicts) with SWC-powered transforms. |
| **ESLint 9 + Prettier 3** | Flat-config linting and formatting across all three packages from the repo root. |
| **Docker Compose** | One command (`docker compose up -d`) for a local MySQL with a health check and a persistent volume — no local MySQL install needed. |
| **[Postman](https://www.postman.com/) / [newman](https://github.com/postmanlabs/newman)** | A scripted end-to-end collection that exercises every endpoint and chains the whole booking flow, runnable headless in CI. |
| **tsx** | Runs the TypeScript seed script directly, no build step. |

## How the Core Mechanisms Work

### Auth: OTP + rotating refresh tokens

1. **Request OTP** — a 6-digit code is generated, stored **SHA-256 hashed** with a 5-minute expiry, and any previous codes for that phone are invalidated (latest-code-wins). The plaintext code is only returned in the response in development; in production it would go out via SMS.
2. **Verify OTP** — timing-safe hash comparison, max 5 attempts per code, both endpoints throttled. On success the user is found-or-created and receives:
   - an **access JWT** (15 min) in the response body — held in memory on the client, never localStorage;
   - a **refresh token** (7 days) as an **httpOnly, sameSite=lax cookie** — invisible to JavaScript, stored server-side only as a hash.
3. **Refresh & rotation** — every call to `/auth/refresh` revokes the presented token and issues a new one *in the same family*. If a token that was **already rotated** is ever presented again, that's proof of theft (the legitimate client holds a newer one) — the **entire family is revoked**, killing the stolen session chain.
4. **On the frontend**, the API client retries a `401` once through `/auth/refresh` and redirects to login if that fails; a silent-refresh hook restores the session on page load.

### Booking: hold → confirm with lazy expiry

1. **Hold** — the server *recomputes* the doctor's currently free slots and rejects any `startsAt` that isn't one of them (client timestamps are never trusted). Inside a transaction it purges an expired hold occupying the slot, then inserts an `Appointment` with status `HELD` and `holdExpiresAt = now + 5 min`. A unique `slotKey` (`"{doctorId}#{startsAtISO}"`) makes concurrent holds on the same slot a database-level impossibility — the loser gets a clean `SLOT_TAKEN` error.
2. **Confirm** — flips the row to `CONFIRMED` if the hold hasn't expired; otherwise `HOLD_EXPIRED`.
3. **No cron jobs.** Expired holds are simply *treated as free* everywhere they're read, and physically cleaned up by the next hold transaction on that slot. The whole system runs without a single background scheduler.

### Time: UTC everywhere, timezone at the edges

Every timestamp in the database and on the wire is a **UTC ISO string**. Doctor availability is stored clinic-local (`weekday` + `"HH:mm"` windows) and converted to concrete UTC instants **per date** with Luxon and `CLINIC_TZ` — per-date conversion (rather than baked-in offsets) is what keeps it correct across DST transitions. The browser converts back to local time with native `Intl` only at render time.

## Getting Started

**Prerequisites:** Node.js ≥ 20, Docker (for MySQL).

```bash
# 1. Install everything (all three workspaces)
npm install

# 2. Start MySQL
docker compose up -d

# 3. Configure env (defaults work out of the box for local dev)
cp .env.example .env

# 4. Migrate + generate the Prisma client, then seed demo data
npm run prisma:migrate -w apps/api      # first run: applies migrations
npm run prisma:seed -w apps/api         # idempotent — safe to re-run

# 5. Run the API  →  http://localhost:3000/api
npm run start:dev -w apps/api

# 6. In another terminal, run the web app  →  http://localhost:5173
npm run dev -w apps/web
```

Interactive API docs (Swagger, generated from the shared Zod DTOs) are at **http://localhost:3000/docs**.

The Vite dev server proxies `/api` to `http://localhost:3000`, so the browser only ever talks to one origin — same-origin requests, a first-party refresh cookie, no CORS. No frontend env file is needed for local dev (`VITE_API_URL` defaults to `/api`); set it only when pointing a built app at a different API origin.

> **Logging in locally:** since no SMS is sent, the OTP code is returned in the response (`devCode`) and printed in the API logs when `NODE_ENV=development`.

## Environment Variables

All live in the root `.env` (consumed by both the API and docker-compose) — see [.env.example](.env.example). The API validates them with Zod at bootstrap and **fails fast** if anything is missing or malformed.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Enables dev conveniences (OTP in response, non-secure cookie). |
| `PORT` | `3000` | API port. |
| `JWT_SECRET` | — | Signs access tokens. **Change it outside local dev.** |
| `CLINIC_TZ` | `Asia/Jerusalem` | The clinic's IANA timezone — the anchor for slot computation. |
| `DATABASE_URL` | local MySQL | Prisma connection string. |
| `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` / `MYSQL_PORT` | dev defaults | Consumed by docker-compose. |

## API Testing (Postman / newman)

A ready-to-run collection lives at [postman/cortex-scheduler.postman_collection.json](postman/cortex-scheduler.postman_collection.json). It covers every endpoint and chains the whole demo flow with post-response scripts — no manual copying of tokens or ids.

**Import into Postman:** File → Import → pick the JSON. `baseUrl` defaults to `http://localhost:3000/api`. Fire the requests top-to-bottom (or use the Collection Runner) — each request captures what the next one needs:

1. **Auth** → Request OTP (fresh random phone, captures `devCode`) → Verify OTP (captures the access token; the refresh cookie lands in Postman's cookie jar)
2. **Specialties** → List Specialties (captures `specialtyId`) → List Doctors (captures `doctorId`)
3. **Doctors** → Get Slots (computes next Monday, captures three free slots)
4. **Appointments** → Hold → Confirm → Reschedule → Cancel → Hold again → Release
5. **Me** → upcoming / past appointments
6. **Health** → health check
7. **Session** → Refresh (rotates the token) → Logout

**Headless with newman:**

```bash
npx newman run postman/cortex-scheduler.postman_collection.json
# 16 requests, 29 assertions, all green against a seeded local API
```

## Automated Tests

```bash
npm test                    # all workspaces
npm test -w apps/api        # API only (Vitest)
```

API tests live in `apps/api/tests/`, prioritized by risk: the **slot engine** (timezone + DST math), **auth/OTP/token services** (rotation, reuse detection, attempt limits), and **booking conflict** behavior. Tests target behavior, not implementation.

## Project Structure

```
cortex-scheduler/
├── apps/
│   ├── api/
│   │   ├── config/          # Zod-validated env + typed ConfigService (sole reader of process.env)
│   │   ├── models/          # PrismaService, entity type re-exports, DB health indicator
│   │   ├── repositories/    # Data access — the ONLY place Prisma queries live
│   │   ├── services/        # Business logic — orchestrates repositories + transactions
│   │   ├── controllers/     # HTTP layer — routes, guards, one service call each
│   │   ├── dtos/            # nestjs-zod request DTOs built from shared schemas
│   │   ├── middlewares/     # JwtAuthGuard, @CurrentUser, global exception filter
│   │   ├── modules/         # NestJS wiring (auth, doctors, appointments, …)
│   │   ├── types/           # Hand-authored internal TS types, grouped by domain
│   │   ├── utils/           # Pure helpers: crypto, slot engine, mappers, domain exceptions
│   │   ├── prisma/          # schema.prisma, migrations, seed script
│   │   └── tests/           # Vitest suites (services + slot engine)
│   └── web/
│       └── src/
│           ├── app/         # Router, layout, route guards, QueryClient
│           ├── features/    # auth, booking, catalog, appointments, dashboard, search
│           ├── components/  # Shared UI primitives (custom, no UI kit)
│           ├── hooks/       # useAuth, useHoldCountdown, useSilentRefresh, …
│           └── lib/         # API client, auth store, query keys, formatters
├── packages/
│   └── shared/              # Zod schemas + error-code union — the API contract
├── postman/                 # End-to-end collection
└── docker-compose.yml       # Local MySQL
```

## Schema Decisions

**UTC everywhere in the database and API.** `Appointment.startsAt` and all timestamps are stored and transmitted as UTC. Clinic-local availability (`DoctorAvailability.startTime`/`endTime`, stored as `"HH:mm"` strings with a `weekday` in Luxon's 1=Mon…7=Sun convention) is converted to concrete UTC instants per-date using Luxon and `CLINIC_TZ`. Doing the conversion per-date rather than storing fixed offsets keeps it DST-safe. Timezone localization for display happens only at the browser edge.

**Slot-hold pattern with lazy expiry.** Booking is two steps: *hold* then *confirm*. A hold inserts an `Appointment` row with status `HELD` and `holdExpiresAt = now + 5 min`. Confirming flips it to `CONFIRMED`. Expired holds are treated as free everywhere in slot computation — there is no cron job; expiry is evaluated lazily at read time and the stale row is purged inside the next hold transaction for that slot. This mirrors how ticketing sites reserve seats and keeps the system free of background schedulers.

**Nullable `slotKey` unique claim instead of `@@unique([doctorId, startsAt])`.** The obvious way to prevent double-booking at the database level is a composite unique on `(doctorId, startsAt)`. But we keep appointment history instead of deleting rows, so a `CANCELLED` row would occupy `(doctorId, startsAt)` forever — the slot reads as free in slot computation, yet every re-book attempt would hit a unique-constraint violation and 409 permanently. Instead, `Appointment.slotKey` is a nullable column set to `"{doctorId}#{startsAtISO}"` while the row actively occupies the slot (`HELD` / `CONFIRMED` / `COMPLETED`) and set to `NULL` on cancellation. MySQL unique indexes permit unlimited `NULL`s, so cancelled history coexists with a fresh booking of the same slot. DB-level conflict prevention is preserved — a live `HELD` or `CONFIRMED` row still holds the unique claim — while a plain `@@index([doctorId, startsAt])` keeps slot-computation queries fast.

**Status enum instead of deleting appointments.** `Appointment.status` is an enum (`HELD | CONFIRMED | CANCELLED | COMPLETED`). Cancelled and completed appointments are retained so the "past appointments" view has real history, and so cancellations are auditable.

**Server re-validates every hold against computed slots.** The hold endpoint never trusts a client-supplied `startsAt`. It recomputes the currently free slots for the doctor+date and rejects any `startsAt` that isn't one of them, closing the overlap gap that a unique constraint alone can't catch (e.g. a timestamp that lands between grid boundaries).

## Data Model

| Model | Purpose |
| --- | --- |
| `User` | Patient, keyed by unique `phone`. |
| `OtpCode` | Hashed one-time codes (SHA-256), attempt counter, expiry. |
| `RefreshToken` | Hashed refresh tokens with `familyId` for rotation + theft detection. |
| `Specialty` | Medical specialty, carries `avgDurationMin` (the slot grid step). |
| `Doctor` | Belongs to a specialty; has availability and appointments. |
| `DoctorAvailability` | Weekly clinic-local windows (`weekday`, `startTime`, `endTime`). |
| `Appointment` | The booking; UTC `startsAt`, status enum, `holdExpiresAt`, `slotKey`. |

## Scripts Reference

Run from the repo root (`-w` targets a workspace):

| Command | What it does |
| --- | --- |
| `npm run start:dev -w apps/api` | API in watch mode. |
| `npm run dev -w apps/web` | Web app dev server. |
| `npm run build` | Builds shared → api → web, in order. |
| `npm test` | Runs every workspace's tests. |
| `npm run lint` / `npm run format` | ESLint / Prettier across the repo. |
| `npm run prisma:migrate -w apps/api` | Create/apply dev migrations. |
| `npm run prisma:seed -w apps/api` | Seed demo data (idempotent). |
| `npm run db:reset -w apps/api` | Drop, re-migrate, re-seed. |

## Roadmap

Built so far: foundation, database, auth, core API + slot holds, and the full booking frontend (login/OTP, dashboard, specialty/doctor/slot/confirm booking flow, appointment management, catalog search). Production deployment is tracked in [PLAN.md](PLAN.md). Next-step features intentionally out of scope: family members, appointment reminders, medical history.
