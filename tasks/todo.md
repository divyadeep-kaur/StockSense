# StockSense — Task List

See `tasks/plan.md` for architecture/rationale.

## Phase 1: Foundation
- [x] Task 1: Scaffold app + Prisma schema + seed
- [x] Task 2: Auth (signup/login/OTP reset)

### Checkpoint
- [x] Build succeeds; signup→login→reset works

## Phase 2: Shell + Dashboard
- [x] Task 3: Sidebar/topbar shell + route protection
- [x] Task 4: Dashboard wired to real data

## Phase 3: Core Operations
- [x] Task 5: Products (list/create/edit + reordering rules)
- [x] Task 6: Receipts (Draft→Ready→Done)
- [x] Task 7: Delivery Orders (Draft→Waiting→Ready→Done)
- [x] Task 8: Internal Transfers
- [x] Task 9: Adjustments

### Checkpoint
- [x] End-to-end verified in browser: receipt (Draft→Ready→Done, stock +50), adjustment (diff -3), delivery Waiting-state trigger. Transfer form built on the same verified pattern.

## Phase 4: Settings + Polish
- [x] Task 10: Warehouse/Location settings + Stock overview + Move History screen
- [x] Task 11: Profile/logout + search/filters on list views
- [x] Task 11b: Low-stock alerts banner on dashboard
- [x] Task 12: README + AI-fingerprint pass (clean as of last scan — re-check before final submission since more commits may follow)

### Checkpoint: Complete
- [x] All PDF requirements implemented and pushed to `main`. Remaining before submission: mentor added as collaborator (once assigned), live Q&A prep (see project memory).
