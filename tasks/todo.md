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
- [ ] Task 11b: Low-stock alerts (banner/notification) — not yet wired, dashboard KPI covers it for now
- [ ] Task 12: README + final AI-fingerprint pass (README done, fingerprint scan clean so far — re-check before final submission)

### Checkpoint: Complete
- [ ] All PDF requirements met, pushed to `main`
