# StockSense — Task List

See `tasks/plan.md` for architecture/rationale.

## Phase 1: Foundation
- [ ] Task 1: Scaffold app + Prisma schema + seed
- [ ] Task 2: Auth (signup/login/OTP reset)

### Checkpoint
- [ ] Build succeeds; signup→login→reset works

## Phase 2: Shell + Dashboard
- [ ] Task 3: Sidebar/topbar shell + route protection
- [ ] Task 4: Dashboard wired to real data

## Phase 3: Core Operations
- [ ] Task 5: Products (list/create/edit + reordering rules)
- [ ] Task 6: Receipts (Draft→Ready→Done)
- [ ] Task 7: Delivery Orders (Draft→Waiting→Ready→Done)
- [ ] Task 8: Internal Transfers
- [ ] Task 9: Adjustments

### Checkpoint
- [ ] End-to-end: receive → transfer → deliver → adjust, all in Move History + Dashboard

## Phase 4: Settings + Polish
- [ ] Task 10: Warehouse/Location settings + Stock overview + Move History screen
- [ ] Task 11: Profile/logout + low-stock alerts + search/filters
- [ ] Task 12: README + final AI-fingerprint pass

### Checkpoint: Complete
- [ ] All PDF requirements met, pushed to `main`
