# Implementation Plan: StockSense

## Overview
Modular Inventory Management System per `StockSense.pdf` + InHand mockup. Next.js (App Router, TS) full-stack app, Prisma + SQLite, custom auth (JWT cookie + OTP password reset). Single-branch hackathon repo — direct commits to `main`, no feature branches.

## Architecture Decisions
- **Next.js App Router + TypeScript**, one repo for frontend+backend (API routes) — fastest path to a demoable full-stack app in a timed round.
- **Prisma + SQLite** — zero external DB setup, file-based, still relational/typed. Swappable to Postgres later if needed.
- **Custom auth** (bcrypt + JWT httpOnly cookie) instead of a library, so OTP-based reset fits exactly the spec's flow.
- **Tailwind CSS**, dark sidebar (Vercel-pattern: icon+label rows, pill highlight, expandable groups, bottom profile row) + light content area (Overview-dashboard palette), matching the InHand mockup screen-for-screen.
- Every stock-changing action (receipt validate, delivery validate, transfer, adjustment) writes one `StockMove` ledger row — single source of truth for Move History + dashboard KPIs + Stock Levels.

## Task List

### Phase 1: Foundation
- [ ] Task 1: Scaffold Next.js+TS+Tailwind app, Prisma schema (User, Warehouse, Location, Category, Product, StockItem, StockMove, Receipt/Line, Delivery/Line, Transfer/Line, Adjustment), seed script
- [ ] Task 2: Auth — signup, login, JWT cookie middleware, OTP request/verify/reset-password

### Checkpoint: Foundation
- [ ] `npm run build` succeeds
- [ ] Can sign up, log out, log in, reset password via OTP end-to-end

### Phase 2: Shell + Dashboard
- [ ] Task 3: App shell — dark sidebar (expandable Operations/Settings groups), top bar, profile menu, route protection
- [ ] Task 4: Dashboard KPIs + Recent Operations + Stock Levels donut, wired to real data

### Phase 3: Core Operations (one vertical slice each)
- [ ] Task 5: Products — list, create/edit (incl. reordering rules), categories
- [ ] Task 6: Receipts — list, detail form, Draft→Ready→Done, validate increments stock + ledger
- [ ] Task 7: Delivery Orders — list, detail form, Draft→Waiting→Ready→Done, validate decrements stock + ledger
- [ ] Task 8: Internal Transfers — list, detail form, validate moves stock between locations + ledger
- [ ] Task 9: Adjustments — list, new form (recorded vs counted qty → diff), validate updates stock + ledger

### Checkpoint: Core Operations
- [ ] Full flow works: receive → transfer → deliver → adjust, all visible in Move History and Dashboard

### Phase 4: Settings + Polish
- [ ] Task 10: Warehouse/Location settings, Stock overview (editable), Move History screen
- [ ] Task 11: Profile + logout confirmation, low-stock alerts, search/filters on list views
- [ ] Task 12: README (setup/run instructions), final pass — no AI fingerprints in code/comments/commits

### Checkpoint: Complete
- [ ] Every PDF requirement present; matches InHand mockup screens
- [ ] Pushed to `main` on the team repo

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope too large for timed round | High | Vertical slices, commit+push after each task so partial progress is always demoable |
| OTP email delivery needs SMTP creds we don't have | Med | Fallback: log OTP server-side via nodemailer transport stub / console when SMTP env vars absent |
| SQLite not ideal for concurrent multi-teammate writes | Low | Fine for hackathon demo scale; note Postgres swap path in README |

## Open Questions
- None blocking — proceeding with defaults above per user's "minimal and working, feature loaded" directive.
