# Smart Campus Room Availability Checker

A small React + TypeScript + Vite + Tailwind prototype. You choose how many people are coming and what equipment you need. The page lists only the matching rooms. You pick one, enter the current time and a start and end time, and the page says **Available** or **Unavailable**, with the reason.

All data is fictional and lives in the browser. There is no login, backend, database, external API or payment.

Started as a Bolt.new export (commit `d809e10`). It was then refactored, extended with a room catalog and filters, and covered by tests (see [Commit history](#commit-history)).

## Rules

| ID | Rule |
|---|---|
| AC1 | Times are integer minutes after midnight, `0 <= start < end <= 1440`, and start must be strictly after now |
| AC2 | Maximum duration is 120 minutes (120 is allowed, 121 is not) |
| AC3 | A blocked room rejects every request |
| AC4 | No overlap with existing bookings; touching at an endpoint (e.g. 600–660 and 660–720) is not an overlap |
| AC5 | Clear Available / Unavailable result; existing bookings are never modified |
| AC6 | Understandable validation messages; layout works on a narrow screen |
| F1 | Room capacity must be at least the number of attendees |
| F2 | Room must have **all** selected equipment |
| F3 | A blocked room is never reported as available (it stays in the list with a "Blocked" badge) |
| F4 | A clear empty state when no rooms match |
| F5 | Switching rooms refreshes the result and uses that room's own bookings |

## Requirements

- **Node.js 18.18 or newer** (ESLint 9 needs ≥ 18.18; Vite 5 and Vitest 2 need `^18 || >=20`). Tested with Node 22.23.4 and npm 10.9.9.
- npm (comes with Node).

## Setup and commands

```sh
npm ci              # install exact dependency versions from package-lock.json
npm run dev         # start the dev server (http://localhost:5173)
npm test            # run all 113 tests once (Vitest + jsdom)
npm run build       # production build into dist/
npm run preview     # serve the production build
npm run typecheck   # TypeScript check (tsc --noEmit)
npm run lint        # ESLint
```

## Project structure

```
src/
  main.tsx                  React entry point
  App.tsx                   State and wiring only: filters, selected room, times, result
  data/
    rooms.ts                Room type, EQUIPMENT list, 5 fictional rooms (1 blocked)
  domain/                   Pure TypeScript, no React
    time.ts                 toHHMM / fromHHMM, MINUTES_PER_DAY, MAX_BOOKING_MINUTES
    availability.ts         validateTimes + checkAvailability: time, duration, blocked, overlap (AC1–AC5, F3)
    roomFilter.ts           parseAttendees, hasCapacity (F1), hasAllEquipment (F2), filterRooms
  components/               Presentation only
    AppHeader, RoomFilters, RoomList, TimeField, TimeReadout, ValidationWarnings,
    CheckActions, ResultCard, BookingsPanel, BookingTimeline, BookingList, RulesPanel
tests/
  setup.ts                  jest-dom matchers, cleanup
  unit/                     availability (25), roomFilter (24), time (10)
  ui/                       App.regression (33: written against the original), features (21: F1–F5, end-to-end)
test-results/               Saved test output: baseline, after-refactor, final
docs/                       Evaluation, diagrams, screenshots
```

"Is this room free at this time?" (`availability.ts`) and "Does this room fit my needs?" (`roomFilter.ts`) are deliberately separate modules.

## Documentation and results

- [docs/EVALUATION.md](docs/EVALUATION.md): before/after module diagrams, design decisions, the quality comparison with how each value was measured, limitations
- [docs/diagrams/](docs/diagrams/): Mermaid sources and PNGs
- [docs/screenshots/](docs/screenshots/): the app in six states, including 390 px mobile width
- [docs/measurements.txt](docs/measurements.txt): raw output of the commands behind the comparison
- [test-results/baseline.txt](test-results/baseline.txt): 30/30, regression tests on the **original** code
- [test-results/after-refactor.txt](test-results/after-refactor.txt): 33/33, after refactoring and the stale-result fix
- [test-results/final.txt](test-results/final.txt): 113/113, final suite (59 unit + 54 UI)

## Known limitations

- The page can't enter an end time of 24:00 (1440). The rules accept it, but `<input type="time">` stops at 23:59.
- `npm audit` reports 2 critical advisories in the dev-only test tooling (`vitest` 2.1.9); the shipped app has none (`npm audit --omit=dev`).
- At 390 px the timeline's hour labels overlap.

The full list is in [docs/EVALUATION.md](docs/EVALUATION.md#remaining-limitations).

## Commit history

| Commit | Step |
|---|---|
| `d809e10` | Original Bolt.new export |
| `3f5b819` | UI regression tests on the untouched original (30/30) |
| `263c2b8` | Pure time/booking logic moved to `src/domain/` |
| `a77bd21` | One validation function for warnings and result |
| `273f13b` | Fix: editing a time clears the stale result |
| `f7ed8ec` | Page split into components |
| `2cdb696` | Room catalog, filters F1–F5, per-room blocked |
| `1688fc5` | Housekeeping: Supabase removed, labels linked, title |
| `1543f39` | Full test suite (113/113) |
| `31e3237` | Evaluation docs |
