# Next Implementation Plan (Unwired APIs + Frontend Issues)

## Goal
Finish wiring the remaining backend APIs that currently aren’t exposed (or aren’t usable) by the frontend, and replace any frontend screens that still rely on `mockData` / placeholder UI.

Primary focus for this iteration (no backend code changes):
1. Frontend: wire existing endpoints into the relevant screens and remove mock-based rendering.
2. Frontend correctness: fix UI/data-shape mismatches (example: DeveloperDirectory).

---

## Approach (no backend changes)
Even without dedicated milestone/bug CRUD routes, the existing `GET /api/v1/contracts` response already includes:
- `milestones`
- `bugReports`

So the screens can be wired by aggregating those embedded records across `contractService.getMyContracts()`.

For earnings, the existing `GET /api/v1/escrow/history` can be used to build the transactions feed.

### Frontend screens still rely on `mockData`
These pages import and render `mockData` instead of API data:
- `frontend/src/pages/Milestones.jsx`
- `frontend/src/pages/BugReports.jsx`
- `frontend/src/pages/Earnings.jsx`
- `frontend/src/pages/DeveloperProfile.jsx`

### Frontend shape mismatch example
- `frontend/src/pages/DeveloperDirectory.jsx` renders `dev.skills`, but `profileController.getDevelopers()` returns `knownTechs` (with joined `tech`), not `skills`.

---

## Phase 1: Frontend wiring (replace mock screens with existing API data)
### 1.1 Milestones screen (read-only from contracts)
Update `frontend/src/pages/Milestones.jsx`:
- Fetch `contractService.getMyContracts()`
- Aggregate `contracts[].milestones`
- Map backend fields to the existing UI model (ex: `milestoneID` -> `milestoneId`, `status` -> `Completed/In Progress/Pending/Upcoming`, escrow/payment status -> `Released/Held/Pending/Not Funded`)
- Keep existing design/theme and handle:
  - loading
  - empty state
  - request errors (toast)

Note: without milestone CRUD routes, the “Add Milestone” / milestone mutations should be disabled or removed in this iteration.

### 1.2 Bug Reports screen (read-only from contracts)
Update `frontend/src/pages/BugReports.jsx`:
- Fetch `contractService.getMyContracts()`
- Aggregate `contracts[].bugReports`
- Map backend fields to the existing UI model (ex: severity and status)
- Keep the current table UI and handle:
  - loading / empty state / errors

Note: without bug CRUD routes, the “Report New Bug” form should be disabled or shown as view-only.

### 1.3 Earnings screen (from escrow history)
Update `frontend/src/pages/Earnings.jsx`:
- Fetch `escrowService.getEscrowHistory()`
- Convert `PaymentEscrow + milestone.contract` into the `earningsTransactions`-shaped items used by the UI

If your UI uses `statsService.getDashboardStats()`, replace it with whatever can be derived from escrow history + contracts (no backend stats route).

---

## Phase 2: Frontend correctness + polish
### 2.1 DeveloperDirectory shape fix
Update `frontend/src/pages/DeveloperDirectory.jsx`:
- Replace `dev.skills` with the backend response shape: use `dev.knownTechs` (and read `knownTechs[].tech.techName`).

### 2.2 Keep the existing “non-AI” theme
When replacing mock UI with API data, preserve the current design system patterns (CSS variables, teal glow, same typography, etc.).

---

## Testing plan (must-pass checklist)
### Build + lint
1. `frontend npm run lint` no errors
2. `frontend npm run build` succeeds

### Manual smoke tests (both roles)
1. Client:
   - Create contract -> verify it shows in workspace
   - See milestones/bugs lists (depending on your visibility rules)
   - Earnings view loads without mockData
2. Developer:
   - Update profile (already done) -> confirm `refreshMe()` updates UI
   - Add/update/remove skills (already done)
   - Milestones CRUD works and persists
   - Bug report CRUD works and persists
3. Data edge cases:
   - Empty states (no milestones/bugs yet)
   - Unauthorized access (should 401/403 without breaking UI)
   - Backend validation errors -> toast shows backend message

---

## Deliverables for this iteration
1. Frontend pages upgraded (no backend changes):
   - `Milestones.jsx`, `BugReports.jsx`, `Earnings.jsx`
2. Frontend bugfix:
   - `DeveloperDirectory.jsx` data-shape alignment

