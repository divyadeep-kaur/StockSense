# StockSense

A modular Inventory Management System (IMS) — track products, warehouses, receipts,
delivery orders, internal transfers, and stock adjustments from one dashboard.

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma + SQLite
- JWT-based auth with OTP password reset

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit `http://localhost:3000`. A seeded demo account is available:

- Email: `manager@stocksense.dev`
- Password: `password123`

### Password reset OTP

If `SMTP_HOST` is left blank in `.env`, OTP codes are logged to the server console
instead of being emailed — check your terminal after requesting a reset.

## Project structure

- `src/app` — routes (public marketing/auth pages, and the authenticated app under `(app)`)
- `src/lib` — Prisma client, auth/session helpers, stock ledger helpers
- `src/components` — shared UI (sidebar, topbar, form primitives)
- `prisma/schema.prisma` — data model
- `tasks/` — build plan and task checklist
