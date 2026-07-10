# Cortex Scheduler

A medical appointment scheduling system. Patients authenticate by phone OTP, browse specialties and doctors, and book appointments against doctor availability using a slot-hold reservation flow that prevents double-booking.

**Monorepo (npm workspaces):**

- `apps/api` — NestJS + Prisma + MySQL
- `apps/web` — React + Vite + Tailwind (built in a later phase)
- `packages/shared` — Zod schemas + types shared by both apps

## Getting started (backend)

```bash
# 1. Install
npm install

# 2. Start MySQL
docker compose up -d

# 3. Migrate + generate client + seed
npm run prisma:migrate -w apps/api      # first run: applies migrations
npm run prisma:seed -w apps/api         # idempotent — safe to re-run

# 4. Run the API (http://localhost:3000/api)
npm run start:dev -w apps/api
```

Environment variables live in `apps/api/.env` (see `apps/api/.env.example`). The root `.env` (see `.env.example`) drives docker-compose.

Interactive API docs (Swagger, generated from the shared Zod DTOs) are at `http://localhost:3000/docs`.

## API testing

A ready-to-run Postman collection lives at [postman/cortex-scheduler.postman_collection.json](postman/cortex-scheduler.postman_collection.json). It covers every endpoint and chains the whole demo flow with post-response scripts — no manual copying of tokens or ids.

**Import into Postman:** File → Import → pick the JSON. The `baseUrl` variable defaults to `http://localhost:3000/api`. Use the Collection Runner (or just fire the requests top-to-bottom) — each request captures what the next one needs:

1. **Auth** → Request OTP (generates a fresh random phone, captures the dev `devCode`) → Verify OTP (captures the access token; the refresh cookie is stored by Postman's cookie jar)
2. **Specialties** → List Specialties (captures `specialtyId`) → List Doctors (captures `doctorId`)
3. **Doctors** → Get Slots (computes next Monday, captures three free slots)
4. **Appointments** → Hold → Confirm → Reschedule → Cancel → Hold again → Release
5. **Me** → upcoming / past appointments
6. **Health** → health check
7. **Session** → Refresh (rotates the token) → Logout

**Run it headless with [newman](https://github.com/postmanlabs/newman):**

```bash
npx newman run postman/cortex-scheduler.postman_collection.json
# 16 requests, 29 assertions, all green against a seeded local API
```

## Schema Decisions

**UTC everywhere in the database and API.** `Appointment.startsAt` and all timestamps are stored and transmitted as UTC. Clinic-local availability (`DoctorAvailability.startTime`/`endTime`, stored as `"HH:mm"` strings with a `weekday` in Luxon's 1=Mon…7=Sun convention) is converted to concrete UTC instants per-date using Luxon and the `CLINIC_TZ` env var (`Asia/Jerusalem`). Doing the conversion per-date rather than storing fixed offsets keeps it DST-safe. Timezone localization for display happens only at the browser edge.

**Slot-hold pattern with lazy expiry.** Booking is two steps: *hold* then *confirm*. A hold inserts an `Appointment` row with status `HELD` and `holdExpiresAt = now + 5 min`. Confirming flips it to `CONFIRMED`. Expired holds are treated as free everywhere in slot computation — there is no cron job; expiry is evaluated lazily at read time and the stale row is purged inside the next hold transaction for that slot. This mirrors how ticketing sites reserve seats and keeps the system free of background schedulers.

**Nullable `slotKey` unique claim instead of `@@unique([doctorId, startsAt])`.** The obvious way to prevent double-booking at the database level is a composite unique on `(doctorId, startsAt)`. But we keep appointment history instead of deleting rows (status enum below), so a `CANCELLED` row would keep occupying `(doctorId, startsAt)` forever — the slot reads as free in slot computation, yet every re-book attempt would hit a unique-constraint violation and 409 permanently. Instead, `Appointment.slotKey` is a nullable column set to `"{doctorId}#{startsAtISO}"` while the row actively occupies the slot (`HELD` / `CONFIRMED` / `COMPLETED`) and set to `NULL` on cancellation. MySQL unique indexes permit unlimited `NULL`s, so cancelled history coexists with a fresh booking of the same slot. DB-level conflict prevention is preserved — a live `HELD` or `CONFIRMED` row still holds the unique claim — while a plain `@@index([doctorId, startsAt])` keeps slot-computation queries fast.

**Status enum instead of deleting appointments.** `Appointment.status` is an enum (`HELD | CONFIRMED | CANCELLED | COMPLETED`). Cancelled and completed appointments are retained so the "past appointments" view has real history, and so cancellations are auditable. Deletion would throw that away.

**Server re-validates every hold against computed slots.** The hold endpoint never trusts a client-supplied `startsAt`. It recomputes the currently free slots for the doctor+date and rejects any `startsAt` that isn't one of them, closing the overlap gap that a unique constraint alone can't catch (e.g. a timestamp that lands between grid boundaries).

## Data model

| Model | Purpose |
| --- | --- |
| `User` | Patient, keyed by unique `phone`. |
| `OtpCode` | Hashed one-time codes (sha256), attempt counter, expiry. |
| `RefreshToken` | Hashed refresh tokens with `familyId` for rotation + theft detection. |
| `Specialty` | Medical specialty, carries `avgDurationMin` (the slot grid step). |
| `Doctor` | Belongs to a specialty; has availability and appointments. |
| `DoctorAvailability` | Weekly clinic-local windows (`weekday`, `startTime`, `endTime`). |
| `Appointment` | The booking; UTC `startsAt`, status enum, `holdExpiresAt`, `slotKey`. |

## Roadmap

Built so far: Phases 0–3 (foundation, database, auth, core API + slot holds). Frontend (Phases 4–7) and production deployment (Phase 8) are tracked in [PLAN.md](PLAN.md). Next-step features intentionally out of scope: family members, appointment reminders, medical history.
