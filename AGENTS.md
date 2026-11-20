# AGENTS.md

Guidance for AI coding agents working in this repository.

## Purpose

Smart Campus Room Availability Checker: a React + TypeScript + Vite + Tailwind prototype.
The user filters rooms by attendees and equipment, picks a room, enters now / start / end,
and gets **Available** or **Unavailable** with a reason. All data is fictional and lives in
the browser: no backend, login, database or external API.

## Architecture

| Path | Role |
|---|---|
| `index.html` → `src/main.tsx` → `src/App.tsx` | Entry point. `App.tsx` holds all state and wires components to the domain functions. |
| `src/domain/time.ts` | `toHHMM`, `fromHHMM`, constants `MINUTES_PER_DAY` (1440) and `MAX_BOOKING_MINUTES` (120). |
| `src/domain/availability.ts` | Booking rules: `validateTimes` (AC1, AC2), `overlap` (AC4), `checkAvailability` (AC1–AC5). |
| `src/domain/roomFilter.ts` | Room filters (F1, F2): capacity and equipment. |
| `src/data/rooms.ts` | Fictional, read-only room catalog with bookings and `blocked` flag. |
| `src/components/` | Presentational components, one per file, no business rules. |
| `tests/unit/` | Vitest unit tests for `src/domain`. |
| `tests/ui/` | Vitest + jsdom + Testing Library tests that render `App`. |
| `docs/`, `test-results/` | Evaluation notes, diagrams, saved test logs. Do not regenerate unless asked. |

## Setup and safe commands

Node 18.18+ (tested on Node 22, npm 10).

```sh
npm ci              # install exact versions from package-lock.json (never `npm install <pkg>`)
npm run dev         # dev server on http://localhost:5173
npm test            # vitest run (all tests, once)
npm run typecheck   # tsc --noEmit -p tsconfig.app.json (covers src/ only)
npm run lint        # eslint .
npm run build       # vite build into dist/ (gitignored)
```

## Coding conventions (already followed by the code)

- Times are **integer minutes after midnight**. Use `MINUTES_PER_DAY` and `MAX_BOOKING_MINUTES`; do not add new `1440` / `120` literals in logic.
- Domain code in `src/domain/` is pure: no React, no state, never mutates its inputs. Use `readonly` arrays and types for inputs.
- Booking rules live only in `src/domain/availability.ts`. Components display results; they do not decide them.
- The live warnings and the Check result both come from `validateTimes`. Keep one source of truth.
- Any edit to a time field or room selection clears the previous result (no stale answers).
- Import from `src` with the `@/` alias (e.g. `@/domain/time`), not relative paths.
- Use `type` aliases, not `interface`. Components are named function exports (`export function ResultCard`) with a `XxxProps` type; only `App` is a default export.
- Style with Tailwind utility classes; icons from `lucide-react`.
- Short comment at the top of a domain file stating its purpose and which ACs it covers.
- No Prettier is configured: match the quote and formatting style of the file you edit.
- Commit messages: one imperative summary line, e.g. `Fix 2c: clear the availability result when any time field is edited`.

## Acceptance criteria (must hold after every change)

- AC1. Candidate times are integer minutes after midnight: 0 <= start < end <= 1440; start must be strictly after now.
- AC2. Duration must not exceed 120 minutes. Exactly 120 minutes is permitted.
- AC3. Reject every request when the selected room is blocked.
- AC4. Reject overlap with any existing booking. Intervals touching at an endpoint do NOT overlap.
- AC5. Display an unambiguous Available / Unavailable result; do not mutate existing bookings.

## Test expectations

Before every commit, run all four and confirm each exits 0:

```sh
npm test && npm run typecheck && npm run lint && npm run build
```

- Every AC1–AC5 test in `tests/unit/availability.test.ts` and `tests/ui/App.regression.test.tsx` must pass.
- A behaviour change needs a test that names the AC or feature it covers (e.g. `describe('checkAvailability – AC2 duration', …)`).
- New domain logic gets unit tests in `tests/unit/`; user-visible behaviour gets a UI test in `tests/ui/`.

## Known issues (do not "fix" without asking)

- Booking intervals are not validated; a reversed booking (`start > end`) never overlaps. Open.
- End time 24:00 cannot be entered on the page (`<input type="time">` stops at 23:59). Documented, kept as is.
- `npm audit` reports dev-only vulnerabilities; fixing the critical ones needs a major Vitest upgrade. Deferred until reviewed.

## Forbidden actions

- No secrets, credentials, `.env` files or real personal data. All names, rooms and bookings stay fictional.
- No deployments or publishing (no hosting, no `npm publish`).
- No destructive commands: `rm -rf`, `git push --force`, `git reset --hard`, rebasing or rewriting pushed history, deleting branches or tags (including `a5-baseline`).
- No dependency changes without the owner's review: do not add, remove or upgrade packages, and do not run `npm audit fix` or edit `package.json` / `package-lock.json`.
- Do not edit, skip, delete or weaken tests (`.skip`, `.only`, loosened assertions) just to make them pass. If a test looks wrong, stop and explain why.
- Do not edit lint or TypeScript config to silence errors.

## Review gates (show before a change is accepted)

1. A short summary: what changed, why, and which AC or issue it addresses.
2. `git diff --stat` and the full `git diff`.
3. The actual output (pass/fail totals and exit codes) of `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
4. Any new or changed tests, with the AC each one covers.
5. Facts vs assumptions: say what you ran or read, and what you are assuming.

Work on a branch, not directly on `main`. Do not push unless asked.
