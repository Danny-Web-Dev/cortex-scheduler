# 🩺 Cortex Scheduler

A medical appointment scheduling system. Patients log in with a one-time code sent to their phone, browse doctors by specialty, and book appointments. Booking uses a **hold-then-confirm flow** — the same trick ticketing sites use to reserve seats — which makes double-booking impossible.

[![CI](https://github.com/Danny-Web-Dev/cortex-scheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/Danny-Web-Dev/cortex-scheduler/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

```
Patient ──► OTP login ──► pick specialty ──► pick doctor ──► pick slot ──► HOLD (5 min) ──► CONFIRM
```

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
  - [Auth: OTP + rotating refresh tokens](#auth-otp--rotating-refresh-tokens)
  - [Booking: hold then confirm, with lazy expiry](#booking-hold-then-confirm-with-lazy-expiry)
  - [Time: UTC everywhere, timezone at the edges](#time-utc-everywhere-timezone-at-the-edges)
- [Getting Started](#getting-started)
  - [Option A — Docker Compose (whole stack, one command)](#option-a--docker-compose-whole-stack-one-command)
  - [Option B — Run every service manually](#option-b--run-every-service-manually)
- [Environment Variables](#environment-variables)
- [API Documentation & Testing](#api-documentation--testing)
  - [📖 Swagger / OpenAPI](#swagger--openapi)
  - [🧪 Postman Collection](#postman-collection)
- [Automated Tests](#automated-tests)
- [Project Structure](#project-structure)
- [Schema Decisions](#schema-decisions)
- [Data Model](#data-model)
- [Scripts Reference](#scripts-reference)
- [Roadmap](#roadmap)

---

## Features

- **Passwordless phone login** — request a one-time code, verify it, you're in. New phone numbers get an account automatically.
- **Secure sessions** — a short-lived access token (15 min) kept only in memory, plus a 7-day refresh token in an httpOnly cookie that is swapped for a new one on every use. If a stolen token is ever reused, the whole session chain is shut down.
- **Doctor catalog** — browse by specialty, or search doctors and specialties by name.
- **Live slot computation** — free time slots are calculated on the spot from each doctor's weekly schedule. Nothing is pre-generated, so there's nothing to keep in sync.
- **Two-phase booking** — picking a slot *holds* it for 5 minutes, giving the patient time to review before *confirming*. An expired hold simply stops counting — no background jobs needed.
- **Appointment management** — reschedule, cancel, release a hold, and view upcoming and past appointments.
- **Interactive API docs** — a Swagger page generated from the same schemas that validate every request, so the docs are always accurate.

## Architecture

**Monorepo (npm workspaces)** — one repo, three packages, one `npm install`:

```
cortex-scheduler/
├── apps/api          NestJS + Prisma + MySQL     — the backend
├── apps/web          React + Vite + Tailwind     — the frontend
└── packages/shared   Zod schemas + types          — the contract both sides import
```

`packages/shared` is the single source of truth for the API contract. Every request shape, response shape, and error code is a Zod schema defined **once** and imported by both sides: the API uses it to validate incoming requests (and generate Swagger docs), the web app uses it to check responses and get its TypeScript types. The two apps literally cannot drift apart.

**The API is split into layers**, each with one job, and requests flow one direction only:

```
HTTP ──► controllers ──► services ──► repositories ──► Prisma ──► MySQL
              │              │
           (guards,       (domain
            DTOs)        exceptions)
```

- **Controllers** declare the route, apply guards, and call exactly one service method. No logic.
- **Services** hold all the business logic. They throw *domain* errors (`SlotTakenException`, not `HttpException`) — a single global filter turns those into HTTP responses with stable error codes the frontend can rely on.
- **Repositories** are the only place database queries live. Each accepts an optional transaction handle, so a service can run several writes as one all-or-nothing step.

**The frontend follows one rule: components render, hooks think.** Server data lives entirely in React Query, business logic lives in custom hooks (`useHoldCountdown`, `useSilentRefresh`), the little client-only state there is (the in-memory access token, the active hold) lives in two tiny Zustand stores, and components stay small and mostly JSX. In dev, Vite forwards `/api` to the backend, so the browser talks to a single origin — no CORS setup, and the refresh cookie is a normal first-party cookie.

## Tech Stack

### Backend (`apps/api`)

| Tool | Why it's here |
| --- | --- |
| **[NestJS](https://nestjs.com/) 11** | Gives the project its structure: modules, dependency injection, guards, and filters. The layered architecture is built into the framework, not just a convention people are asked to follow. It also makes services easy to test without a real network or database. |
| **[Prisma](https://www.prisma.io/) 5** | Type-safe database access — every query is checked against the schema when the code compiles. Migrations, seeding, and transactions (used to make hold/confirm all-or-nothing) come built in. |
| **[MySQL](https://www.mysql.com/) 8.4** | A proven relational database. One specific behavior matters here: a unique column may contain any number of `NULL`s, and the double-booking guard depends on it — see [Schema Decisions](#schema-decisions). |
| **[Zod](https://zod.dev/) 4** | Checks data at every boundary while the app runs: incoming requests, environment variables at startup (the app refuses to boot if config is missing), and API responses on the frontend. One schema gives you validation + a TypeScript type + a Swagger doc. |
| **[nestjs-zod](https://github.com/BenLorantfy/nestjs-zod)** | The bridge that turns the shared Zod schemas into NestJS DTO classes and OpenAPI definitions — validation and docs come from the contract instead of being written twice. |
| **[@nestjs/jwt](https://docs.nestjs.com/security/authentication)** | Signs and verifies the short-lived access tokens. Verification needs no database lookup, so authenticated requests stay fast. |
| **[@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)** | Rate-limits the OTP endpoints so codes can't be brute-forced or spammed to someone's phone. |
| **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** | Serves the interactive API docs at `/docs`, generated from the Zod DTOs — always in sync with what the API actually accepts. |
| **[@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)** | A standard `/health` endpoint with a real database connectivity check — the thing a load balancer or uptime monitor should probe. |
| **[Luxon](https://moment.github.io/luxon/)** | The one place timezone math happens on the server: turning the clinic's local weekly hours (`"09:00"–"13:00"`, Asia/Jerusalem) into exact UTC times for each date — correctly, even across daylight-saving changes. |
| **[nestjs-pino](https://github.com/iamolegga/nestjs-pino) + pino** | Structured JSON request logging with almost no overhead; `pino-pretty` makes it readable in dev. |
| **[cookie-parser](https://github.com/expressjs/cookie-parser)** | Reads the httpOnly refresh-token cookie on `/auth/refresh` and `/auth/logout`. |
| **node:crypto** (built-in) | SHA-256 hashing of OTP codes and refresh tokens before they're stored, plus timing-safe comparison — no plaintext secret ever touches the database. |

### Frontend (`apps/web`)

| Tool | Why it's here |
| --- | --- |
| **[React](https://react.dev/) 19** | The component model fits the step-by-step booking flow (specialty → doctor → slot → confirm) naturally. |
| **[Vite](https://vite.dev/) 8** | Instant dev server with hot reload, and the dev proxy that lets the app call `/api` on its own origin. |
| **[TanStack React Query](https://tanstack.com/query) 5** | Owns *all* server data — caching, refetching, loading/error states. After a change (like booking a slot), the related data refreshes automatically. No server data ever lands in `useState` or context. |
| **[Zustand](https://zustand-demo.pmnd.rs/) 5** | A tiny store for the two pieces of state that aren't server data: the in-memory access token and the currently held slot. A few lines each — no boilerplate, no providers. |
| **[React Router](https://reactrouter.com/) 7** | Client-side routing with auth-aware guards (`ProtectedRoute`, `PublicOnlyRoute`). |
| **[react-i18next](https://react.i18next.com/) + i18next** | Every piece of text the user sees lives in one translation file (`i18n/en.json`) — nothing is hardcoded in components. Adding a second language later means adding a file, not rewriting the UI. |
| **[Tailwind CSS](https://tailwindcss.com/) 4** | Utility-first styling with no UI-kit dependency — the shared building blocks (buttons, cards, toasts) are custom-built in `components/ui/`, on top of a small brand theme defined in one CSS file. |
| **Zod** (again) | Checks every API response as it arrives, so a backend change breaks loudly in dev instead of quietly rendering `undefined`. |

### Shared / tooling

| Tool | Why it's here |
| --- | --- |
| **TypeScript 5 (strict)** | Everywhere. No `any`, no `@ts-ignore`, no non-null assertions — enforced by config and convention. |
| **npm workspaces** | Monorepo glue with no extra tooling: one lockfile, `@cortex/shared` resolved locally, per-workspace scripts via `-w`. |
| **[Vitest](https://vitest.dev/) 4** | Fast unit tests for the API (slot engine, auth, tokens, booking conflicts). |
| **ESLint 9 + Prettier 3** | Linting and formatting for all three packages, run from the repo root. |
| **Docker Compose** | Runs the whole stack — MySQL, API, and web (nginx) — each with a health check; MySQL data survives restarts in a named volume. See [Getting Started](#getting-started). |
| **[Postman](https://www.postman.com/) / [newman](https://github.com/postmanlabs/newman)** | A scripted collection that exercises every endpoint and chains the whole booking flow end to end, runnable headless in CI. |
| **tsx** | Runs the TypeScript seed script directly, no build step. |

## How It Works

### Auth: OTP + rotating refresh tokens

1. **Request a code** — a 6-digit code is generated, stored **SHA-256 hashed** with a 5-minute expiry, and any older codes for that phone stop working (latest code wins).
2. **Verify the code** — hashes are compared in a timing-safe way, each code allows at most 5 attempts, and both endpoints are rate-limited. On success the user is found (or created) and receives:
   - an **access token** (15 min) in the response body — kept in memory on the client, never in localStorage;
   - a **refresh token** (7 days) as an **httpOnly cookie** — invisible to JavaScript, stored server-side only as a hash.
3. **Refresh & rotation** — every call to `/auth/refresh` retires the presented token and issues a fresh one *in the same family*. If a token that was **already used** ever shows up again, that can only mean it was stolen (the real client holds a newer one) — so the **entire family is revoked** and the stolen session dies with it.
4. **On the frontend**, the API client retries a `401` once through `/auth/refresh` and sends the user to login if that fails; a silent-refresh hook restores the session on page load.

### Booking: hold then confirm, with lazy expiry

1. **Hold** — the server *recomputes* the doctor's currently free slots and rejects any requested time that isn't one of them (times sent by the client are never trusted). Inside a transaction it clears out any expired hold on that slot, then inserts an `Appointment` with status `HELD` and `holdExpiresAt = now + 5 min`. A unique `slotKey` (`"{doctorId}#{startsAtISO}"`) means two people can never hold the same slot — the database itself refuses the second insert, and that user gets a clean `SLOT_TAKEN` error.
2. **Confirm** — flips the row to `CONFIRMED` if the hold hasn't expired; otherwise the user gets `HOLD_EXPIRED`.
3. **No background jobs.** An expired hold is simply *treated as free* everywhere the code reads slots, and the stale row is physically removed by the next hold on that slot. The whole system runs without a single scheduler or cron job.

### Time: UTC everywhere, timezone at the edges

Every timestamp in the database and on the wire is a **UTC ISO string**. Doctor availability is stored in clinic-local terms (`weekday` + `"HH:mm"` windows) and converted to exact UTC times **per date** with Luxon and `CLINIC_TZ`. Converting per date (instead of storing a fixed offset) is what keeps it correct when daylight-saving time starts or ends. The browser converts back to the viewer's local time with the built-in `Intl` API, only at render time.

## Getting Started

Both options start with the same env file — copy it once, either way:

```bash
cp .env.example .env
```

Then pick a path: **Option A** runs the whole stack in Docker with one command (no local Node or MySQL needed); **Option B** runs each service on your machine directly (hot reload — best for active development).

### Option A — Docker Compose (whole stack, one command)

**Prerequisites:** Docker only.

`docker-compose.yml` builds and runs all three pieces — MySQL, the API, and the web app (served by nginx, which forwards `/api/*` to the API container — same origin, no CORS):

```bash
# 1. Build and start mysql + api + web
docker compose up -d --build

# 2. Wait for all three to report healthy
docker compose ps

# 3. Seed demo data (safe to re-run)
docker compose exec api npm run prisma:seed
```

| Service | URL |
| --- | --- |
| **Web app** | http://localhost:8080 |
| **API** (via nginx proxy) | http://localhost:8080/api |

> The `api` container's port isn't opened to your machine in this compose file (nginx is the only public entry point, and it only forwards `/api/*`) — so **the Swagger page isn't reachable under Option A** as-is. Either use Option B for docs, or temporarily add `ports: ['3000:3000']` to the `api` service in `docker-compose.yml`.

Useful follow-ups: `docker compose logs -f api` to watch logs, `docker compose down` to stop, `docker compose down -v` to also wipe the database.

### Option B — Run every service manually

**Prerequisites:** Node.js ≥ 20, Docker (for MySQL only).

```bash
# 1. Install everything (all three workspaces)
npm install

# 2. Start MySQL only (not the full stack)
docker compose up -d mysql

# 3. Apply migrations + generate the Prisma client, then seed demo data
npm run prisma:migrate -w apps/api      # first run: applies migrations
npm run prisma:seed -w apps/api         # safe to re-run

# 4. Run the API  →  http://localhost:3000/api
npm run start:dev -w apps/api

# 5. In another terminal, run the web app  →  http://localhost:5173
npm run dev -w apps/web
```

The Vite dev server forwards `/api` to `http://localhost:3000`, so the browser only ever talks to one origin — no CORS, and the refresh cookie is a normal first-party cookie. No frontend env file is needed for local dev (`VITE_API_URL` defaults to `/api`); set it only when pointing a built app at a different API.

Interactive API docs (Swagger) are at **http://localhost:3000/docs** — see [Swagger / OpenAPI](#swagger--openapi) below.

> **Logging in locally (either option):** no SMS is sent, so the code appears right in the response (`devCode`) and in the API logs whenever `NODE_ENV=development`. The login page shows it as a hint in dev.

## Environment Variables

All live in the root `.env` (used by both the API and docker-compose) — see [.env.example](.env.example). The API checks them with Zod at startup and **refuses to boot** if anything is missing or malformed.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Turns on dev conveniences (OTP in the response, non-secure cookie). |
| `PORT` | `3000` | API port. |
| `JWT_SECRET` | — | Signs access tokens. **Change it outside local dev.** |
| `CLINIC_TZ` | `Asia/Jerusalem` | The clinic's IANA timezone — the anchor for slot computation. |
| `DATABASE_URL` | local MySQL | Prisma connection string (Option B; the `api` container builds its own, pointing at the `mysql` service). |
| `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` / `MYSQL_PORT` | dev defaults | Used by docker-compose for the `mysql` service. |
| `WEB_PORT` | `8080` | Host port for the `web` (nginx) container — Option A only. |

## API Documentation & Testing

### Swagger / OpenAPI

Interactive, always-accurate API docs — generated straight from the same Zod schemas that validate every request, so the docs can never drift from what the API actually accepts.

**➜ http://localhost:3000/docs**

Browse every route grouped by controller, inspect request/response models, and fire test calls straight from the browser (click **Authorize** and paste an access token from `/auth/otp/verify` to try authenticated endpoints). Requires Option B, or Option A with port `3000` opened — see [Getting Started](#getting-started).

### Postman Collection

A ready-to-run collection lives at [postman/cortex-scheduler.postman_collection.json](postman/cortex-scheduler.postman_collection.json). It covers **every endpoint** and chains the whole demo flow with post-response scripts — no manual copying of tokens or ids.

**Import into Postman:** File → Import → pick the JSON. `baseUrl` defaults to `http://localhost:3000/api`. Fire the requests top-to-bottom (or use the Collection Runner) — each request captures what the next one needs:

1. **Auth** → Request OTP (fresh random phone, captures `devCode`) → Verify OTP (captures the access token; the refresh cookie lands in Postman's cookie jar)
2. **Specialties** → List Specialties (captures `specialtyId`) → List Doctors (captures `doctorId`)
3. **Doctors** → Get Slots (computes next Monday, captures three free slots)
4. **Search** → full-text search across specialties and doctors
5. **Appointments** → Hold → Confirm → Reschedule → Cancel → Hold again → Release
6. **Me** → upcoming / past appointments → Update Profile
7. **Health** → health check
8. **Session** → Refresh (rotates the token) → Logout

**Headless with newman:**

```bash
npx newman run postman/cortex-scheduler.postman_collection.json
# 18 requests, 34 assertions, all green against a seeded local API
```

## Automated Tests

```bash
npm test                    # all workspaces
npm test -w apps/api        # API only (Vitest)
```

API tests live in `apps/api/tests/`, ordered by risk: the **slot engine** (timezone + daylight-saving math), **auth/OTP/token services** (rotation, reuse detection, attempt limits), and **booking conflict** behavior. Tests target behavior, not implementation details.

## Project Structure

```
cortex-scheduler/
├── apps/
│   ├── api/
│   │   ├── config/          # Zod-validated env + typed ConfigService (sole reader of process.env); domain constants
│   │   ├── models/          # PrismaService, entity type re-exports, DB health indicator
│   │   ├── repositories/    # Data access — the ONLY place Prisma queries live
│   │   ├── services/        # Business logic — orchestrates repositories + transactions
│   │   ├── controllers/     # HTTP layer — routes, guards, one service call each
│   │   ├── dtos/            # nestjs-zod request DTOs built from shared schemas
│   │   ├── middlewares/     # JwtAuthGuard, @CurrentUser, global exception filter
│   │   ├── modules/         # NestJS wiring (auth, doctors, appointments, …)
│   │   ├── types/           # Hand-authored internal TS types, grouped by domain
│   │   ├── utils/           # Pure helpers: crypto, slot engine, general helpers, mappers, domain exceptions
│   │   ├── prisma/          # schema.prisma, migrations, seed script
│   │   ├── tests/           # Vitest suites (services + slot engine)
│   │   └── Dockerfile       # Multi-stage build → production Node image
│   └── web/
│       ├── src/
│       │   ├── app/         # Router, layout, header/nav, route guards
│       │   ├── pages/       # Routed screens — pure composition of components (auth, dashboard, booking, appointments)
│       │   ├── components/  # Visual blocks by domain (booking, catalog, search, appointments, dashboard, ui/ primitives)
│       │   ├── hooks/       # Business logic — "hooks think", by domain (auth, booking, appointments, search)
│       │   ├── state/       # React Query client, zustand stores (auth, hold), context providers (booking, search, toast)
│       │   ├── api/         # domains/ (typed request fns) + queries/ (React Query hooks)
│       │   ├── config/      # Routes, query keys, endpoints, env
│       │   ├── i18n/        # Translation strings
│       │   └── utils/       # Pure helpers (cx, formatters, error messages)
│       ├── nginx.conf       # Same-origin /api proxy for the containerized build
│       └── Dockerfile       # Multi-stage build → static nginx image
├── packages/
│   └── shared/              # Zod schemas + error-code union — the API contract
├── postman/                 # End-to-end Postman/newman collection
└── docker-compose.yml       # Full stack: mysql + api + web (see Getting Started)
```

## Schema Decisions

**UTC everywhere in the database and API.** `Appointment.startsAt` and all other timestamps are stored and sent as UTC. Clinic-local availability (`DoctorAvailability.startTime`/`endTime`, stored as `"HH:mm"` strings with a `weekday` in Luxon's 1=Mon…7=Sun convention) is converted to exact UTC times per date using Luxon and `CLINIC_TZ`. Converting per date, rather than storing fixed offsets, keeps it correct across daylight-saving changes. Converting to the viewer's timezone happens only in the browser, at render time.

**Slot-hold pattern with lazy expiry.** Booking is two steps: *hold* then *confirm*. A hold inserts an `Appointment` row with status `HELD` and `holdExpiresAt = now + 5 min`. Confirming flips it to `CONFIRMED`. An expired hold is treated as free everywhere slots are read — there is no cron job; expiry is checked at read time, and the stale row is removed inside the next hold transaction for that slot. This mirrors how ticketing sites reserve seats, and keeps the system free of background schedulers.

**Nullable `slotKey` unique claim instead of `@@unique([doctorId, startsAt])`.** The obvious way to block double-booking at the database level is a unique constraint on `(doctorId, startsAt)`. But this project keeps appointment history instead of deleting rows — so a `CANCELLED` row would occupy `(doctorId, startsAt)` forever: the slot would look free in slot computation, yet every attempt to re-book it would hit the unique constraint and fail with a 409, permanently. Instead, `Appointment.slotKey` is a nullable column set to `"{doctorId}#{startsAtISO}"` while the row actively occupies the slot (`HELD` / `CONFIRMED` / `COMPLETED`) and set to `NULL` on cancellation. MySQL unique indexes allow any number of `NULL`s, so cancelled history can coexist with a fresh booking of the same slot. The database still blocks conflicts — a live `HELD` or `CONFIRMED` row holds the unique claim — while a plain `@@index([doctorId, startsAt])` keeps slot-computation queries fast.

**Status enum instead of deleting appointments.** `Appointment.status` is an enum (`HELD | CONFIRMED | CANCELLED | COMPLETED`). Cancelled and completed appointments are kept, so the "past appointments" view shows real history and cancellations leave a trail.

**The server re-validates every hold against computed slots.** The hold endpoint never trusts a client-supplied `startsAt`. It recomputes the currently free slots for that doctor and date and rejects any time that isn't one of them — closing the gap a unique constraint alone can't catch (e.g. a timestamp that lands between grid boundaries).

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
| `npm run prisma:seed -w apps/api` | Seed demo data (safe to re-run). |
| `npm run db:reset -w apps/api` | Drop, re-migrate, re-seed. |

**Docker Compose** (Option A — see [Getting Started](#getting-started)):

| Command | What it does |
| --- | --- |
| `docker compose up -d --build` | Build and start mysql + api + web. |
| `docker compose up -d mysql` | Start only MySQL (for Option B). |
| `docker compose ps` | Check container health. |
| `docker compose logs -f api` | Watch a service's logs (`api`, `web`, or `mysql`). |
| `docker compose exec api npm run prisma:seed` | Seed demo data inside the running `api` container. |
| `docker compose down` | Stop and remove containers (keeps the MySQL data). |
| `docker compose down -v` | Also delete the MySQL data — full reset. |

## Roadmap

Built so far: foundation, database, auth, core API + slot holds, and the full booking frontend (login/OTP, dashboard, specialty/doctor/slot/confirm booking flow, appointment management, catalog search). Production deployment is tracked in [PLAN.md](PLAN.md). Next-step features intentionally out of scope: family members, appointment reminders, medical history.
