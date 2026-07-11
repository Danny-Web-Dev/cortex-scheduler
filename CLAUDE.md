# CLAUDE.md — Cortex Scheduler Coding Standards

Monorepo: npm workspaces. `apps/api` (NestJS + Prisma + MySQL), `apps/web` (React + Vite + Tailwind), `packages/shared` (Zod schemas + types).

---

## 1. Universal JS/TS Rules (apply everywhere)

- **NEVER use the `else` keyword.** Guard clauses and early returns only.
- **Arrow functions only:** `const doThing = () => {}`. Never `function doThing()`.
- **Named exports only.** Never `export default` (exception: files where the framework requires it, e.g. Vite config).
- **Strict TypeScript.** No `any`, no `@ts-ignore`, no non-null assertions (`!`). Prefer `unknown` + narrowing.
- **`async/await` only.** Never `.then()` chains. Never mix the two.
- **No magic numbers or strings.** Named constants, co-located per module (`export const HOLD_TTL_MIN = 5`).
- **All external input validated with Zod** at the boundary (API DTOs, env vars, API responses in web).
- **Small single-responsibility files.** If a file needs a section comment, split it.
- **Dates:** store and transmit **UTC ISO strings** everywhere. Timezone conversion happens only at the edges — Luxon + `CLINIC_TZ` on the API when computing slots from clinic-local availability, native `Intl` in the browser for display.

### Golden example — guard clause instead of else
```ts
// ✅
const getSlotLabel = (slot: Slot) => {
  if (slot.isTaken) return 'Unavailable';
  return formatTime(slot.startsAt);
};

// ❌ never
const getSlotLabel = (slot: Slot) => {
  if (slot.isTaken) {
    return 'Unavailable';
  } else {
    return formatTime(slot.startsAt);
  }
};
```

### Golden example — shared Zod schema as the single source of truth
```ts
// packages/shared/src/schemas/appointment.ts
export const CreateAppointmentSchema = z.object({
  doctorId: z.string().cuid(),
  startsAt: z.string().datetime(), // UTC ISO
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
```

---

## 2. Backend Rules (apps/api — NestJS)

### Architecture & layering

The API is organized by **technical layer**, one folder per responsibility. Each folder has a barrel `index.ts` and cross-layer imports go through it (`../services`, `../repositories`, `../utils`), never deep paths.

```
src/
├── config/         # Zod-validated env + typed ConfigService (sole reader of process.env)
├── models/         # Prisma access: PrismaService, entity type re-exports, health indicator
├── repositories/   # Data-access layer — the ONLY place Prisma queries live
├── services/       # Business logic (the brain) — orchestrates repositories + transactions
├── controllers/    # HTTP layer — route decorators, guards, one service call
├── dtos/           # nestjs-zod request DTOs (validation from shared Zod schemas)
├── middlewares/    # JwtAuthGuard, @CurrentUser, global exception filter
├── types/          # Hand-authored API-internal TS types (params, results, executor, …), grouped by domain
├── utils/          # Pure helpers: crypto, slot engine, constants, mappers, domain exceptions
└── *.module.ts     # NestJS wiring at the src root (auth, doctors, appointments, …)
```

- **Hand-authored TS types live in `types/`** (grouped by domain, one barrel `index.ts`), imported via `../types`. Prisma entity re-exports stay in `models/`, and Zod-inferred types (e.g. `Env`) stay co-located with their schema.

- **Controllers do controller things only:** declare the route, apply guards/decorators, receive the validated DTO, call ONE service method, return its result. No business logic, no data shaping, no try/catch, no data access — ever.
- **All business logic lives in the service layer.** If a controller method is more than ~5 lines, logic has leaked into it. Services never touch Prisma directly — they call repositories (and open `prisma.$transaction` only to orchestrate a multi-repository write, passing the `tx` executor down).
- **Repositories are the data-access layer.** Every Prisma query lives in a repository method; they take an optional `PrismaExecutor` so a caller can run them inside an open transaction. Repositories return entities/rows, never HTTP concerns.
- **Cross-feature capability → inject the exported service via DI** (import the module that exports it). Never deep-import another feature's internals; never instantiate with `new`.
- **Config:** one Zod-validated, typed config service loaded at bootstrap (fail fast on missing env). `process.env` is never accessed anywhere else.

### Error handling

- **Services throw domain exceptions**, small classes extending a common `DomainException` (e.g. `SlotTakenException`, `HoldExpiredException`, `OtpAttemptsExceededException`). Services never throw Nest `HttpException` — HTTP is the controller layer's dialect, not the domain's.
- **One global exception filter** maps domain exceptions → HTTP status + consistent body: `{ error: { code, message } }`. Unknown errors → 500 with a generic message; the real error is logged, never leaked to the client.
- **Error codes are a shared union type in `packages/shared`** (`'SLOT_TAKEN' | 'HOLD_EXPIRED' | ...`) so the frontend switches on `error.code`, never parses message strings.
- **No swallowed errors.** No empty catch blocks. Catch only when you can add context or recover; otherwise let it propagate to the filter.

### Data & Prisma

- Prisma is accessed **only through the `repositories/` layer** (which injects a single `PrismaService` from `models/`). Never query Prisma from controllers, services, guards, or pipes — go through a repository.
- **Multi-step writes always inside `prisma.$transaction`.** The service opens the transaction and passes the `tx` executor into each repository call so they enlist in it.
- **Services never return raw entities to controllers.** Map to response DTOs (shapes from `packages/shared`) — the DB schema never leaks into the API contract.
- Expected constraint violations (P2002 on hold insert) are caught in the service and rethrown as domain exceptions.

### Domain rules

- **Booking = hold then confirm.** Hold re-validates `startsAt` against currently computed free slots (never trust client timestamps), then in a transaction purges an expired hold on the slot and inserts HELD with `holdExpiresAt = now + HOLD_TTL_MIN`. Expired holds are treated as free everywhere (lazy expiry — no cron).
- **Auth tokens:** access JWT (15 min) in response body; refresh token (7 d) as httpOnly cookie, stored hashed, rotated on refresh; reuse of a revoked token revokes the whole family.
- **OTP:** stored hashed (node:crypto), max 5 attempts, both endpoints throttled; plain code returned only when `NODE_ENV=development`.

---

## 3. Frontend Rules (apps/web — React)

- **`@/` alias → `src/`**, configured in `tsconfig.json` paths + `vite.config.ts` resolve.alias. Never deep relative paths like `../../hooks/useSlots`.
- **Barrels:** one `index.ts` per top-level folder (`hooks`, `components/ui`, `lib`, `features/*`). Barrels only re-export — no logic. Never import a barrel from inside its own folder (circular import risk); siblings use direct relative paths.
- **Components: ~100 lines as the ceiling guideline.** Not a hard cutoff, but a strong signal the component is doing too much. Going slightly over is fine when splitting would hurt readability.
- **Components render, hooks think.** When a component accumulates logic (multiple `useState`/`useEffect`, derived state, handlers with business rules), extract a custom hook (`useBookingStepper`, `useHoldCountdown`) in `hooks/`. The component keeps only JSX and simple bindings.
- **React Query for all server state.** No server data in useState/useReducer/context. Query keys in one `queryKeys.ts` factory file.
- **Access token lives in memory only** — never localStorage. On 401 the API client calls `/auth/refresh` once (`credentials: 'include'`) and retries; refresh failure → redirect to login.
- Every query renders three states: loading (skeleton), error (retryable message keyed off `error.code`), success.
- Mutations: optimistic where safe, invalidate related queries on settle.
- Tailwind only, custom components — no UI kit. Shared primitives in `components/ui/`.
- Components: typed props, named export, co-located tests (`SlotGrid.tsx` + `SlotGrid.test.tsx`; hooks likewise).

### Golden example — component/hook split
```tsx
// ✅ hooks/useHoldCountdown.ts — logic lives here
export const useHoldCountdown = (holdExpiresAt: string) => {
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(holdExpiresAt));

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(computeSecondsLeft(holdExpiresAt)), 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  return { secondsLeft, isExpired: secondsLeft <= 0, label: formatCountdown(secondsLeft) };
};

// ✅ ConfirmStep.tsx — component only renders
export const ConfirmStep = ({ hold }: ConfirmStepProps) => {
  const { label, isExpired } = useHoldCountdown(hold.holdExpiresAt);

  if (isExpired) return <HoldExpiredNotice />;
  return <p>Slot held for {label}</p>;
};
```

---

## 4. Testing

- Vitest, tests co-located next to source (`*.test.ts`)
- Priority order: slot computation logic → OTP + refresh token services → booking conflicts/holds → UI smoke tests
- Test behavior, not implementation

## 5. Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Small commits, each phase task from PLAN.md ≈ 1–3 commits
- `main` always in a working state
