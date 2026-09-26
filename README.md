# 📦 StockSense

### Smart Inventory. Seamless Operations.

**StockSense** is a modular Inventory Management System (IMS) designed to replace manual registers, spreadsheets, and fragmented stock-tracking methods with a centralized, real-time platform.

It enables businesses to manage **products, warehouses, receipts, deliveries, internal transfers, inventory adjustments, and stock history** from one unified dashboard.

---

## 🎯 Problem Statement

Businesses often rely on Excel sheets, paper registers, and disconnected systems to manage inventory.

This creates problems such as:

* Inaccurate stock counts
* Difficulty tracking where products are located
* Delayed identification of low-stock items
* Manual calculation of stock movements
* Poor visibility across multiple warehouses
* No centralized history of inventory changes

### Our Solution

StockSense provides a single platform where every inventory movement is recorded and reflected in stock levels automatically.

> **Receive → Store → Transfer → Deliver → Adjust → Track**

Every operation contributes to a centralized **Stock Ledger**, giving businesses a reliable record of what happened to their inventory and when.

---

# ✨ Core Features

## 📊 Real-Time Dashboard

A centralized dashboard provides an overview of:

* Total products in stock
* Low-stock items
* Out-of-stock items
* Pending receipts
* Pending deliveries
* Scheduled internal transfers
* Recent inventory operations

### Dynamic Filters

Operations can be filtered by:

* Document type — Receipts / Deliveries / Internal Transfers / Adjustments
* Status — Draft / Waiting / Ready / Done / Canceled
* Warehouse or location
* Product category

---

## 📦 Product Management

Create and manage products with:

* Product name
* SKU / Code
* Category
* Unit of Measure
* Initial stock
* Reordering rules
* Stock availability by location

---

## 📥 Receipts — Incoming Stock

Record goods received from suppliers.

**Workflow:**

```text
Create Receipt
      ↓
Select Supplier
      ↓
Add Products & Quantities
      ↓
Validate
      ↓
Stock Automatically Increases
```

Example:

```text
Receive 100 kg Steel Rods
→ Stock +100 kg
```

---

## 📤 Delivery Orders — Outgoing Stock

Manage goods leaving the warehouse for customers.

**Workflow:**

```text
Create Delivery
      ↓
Select Products
      ↓
Pick / Pack
      ↓
Validate
      ↓
Stock Automatically Decreases
```

Example:

```text
Deliver 20 Chairs
→ Stock -20
```

---

## 🔄 Internal Transfers

Move inventory between warehouses or locations without changing the company's total stock.

Examples:

```text
Main Warehouse → Production Floor
Rack A → Rack B
Warehouse 1 → Warehouse 2
```

The system updates the source and destination locations and records the movement in the Stock Ledger.

---

## 🛠️ Inventory Adjustments

Correct discrepancies between recorded inventory and physical stock.

Example:

```text
Recorded Stock: 50
Physical Count: 47

Adjustment: -3
```

The adjustment is automatically reflected in inventory and logged for future reference.

---

## 📜 Stock Ledger / Move History

Every inventory movement is recorded with relevant details such as:

* Date & time
* Operation type
* Product
* Quantity
* Source location
* Destination location
* Status
* User

This creates a complete audit trail of inventory activity.

---

## 🏭 Multi-Warehouse Support

Manage inventory across multiple warehouses and locations.

Example:

```text
Warehouse 1
├── Main Store
├── Rack A
└── Production Floor

Warehouse 2
└── Rack B
```

Users can view stock independently by warehouse or location.

---

## 🚨 Smart Inventory Alerts

StockSense can identify products approaching their reorder threshold and highlight:

* Low-stock products
* Out-of-stock products
* Reordering requirements

---

## 🔎 Smart Search & Filtering

Quickly find products and operations using:

* Product name
* SKU
* Category
* Warehouse
* Location
* Operation type
* Status

---

# 🔐 Authentication

StockSense includes:

* User registration
* Login
* Session-based authentication
* Email-based OTP password reset (see [Password Reset](#-password-reset) below)
* Protected application routes

---

# 🧭 Inventory Flow

The central concept behind StockSense is simple:

```text
          SUPPLIER
             │
             ▼
       ┌─────────────┐
       │   RECEIPT   │
       └──────┬──────┘
              │ + Stock
              ▼
       ┌─────────────┐
       │  WAREHOUSE  │
       └──────┬──────┘
              │
        ┌─────┴─────┐
        ▼           ▼
   INTERNAL      DELIVERY
   TRANSFER          │
        │             ▼
        ▼          CUSTOMER
  NEW LOCATION

              +
        ADJUSTMENTS
              │
              ▼
       STOCK LEDGER
```

The goal is to ensure that **every stock movement has a corresponding system record**.

---

# 🖥️ Application Modules

```text
StockSense
│
├── Dashboard
│
├── Products
│   ├── Products
│   ├── Categories
│   └── Reordering Rules
│
├── Operations
│   ├── Receipts
│   ├── Delivery Orders
│   ├── Internal Transfers
│   ├── Inventory Adjustments
│   └── Move History
│
├── Warehouse
│   └── Locations
│
├── Settings
│
└── Profile
    ├── My Profile
    └── Logout
```

---

# 🛠️ Technology Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend

* **Next.js App Router / API**
* **Prisma ORM**
* **SQLite**

### Authentication

* JWT-based authentication
* OTP-based password reset

### Development

* Node.js
* Git & GitHub

---

# 🏗️ Architecture

```text
┌───────────────────────────┐
│       Next.js Frontend    │
│  Dashboard / Forms / UI   │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│      API / Server Logic   │
│ Authentication & Business │
│         Operations        │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       Prisma ORM          │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│          SQLite           │
│ Products / Stock / Users  │
│ Operations / Ledger       │
└───────────────────────────┘
```

---

# 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/divyadeep-kaur/StockSense.git
cd StockSense
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

At minimum, set `RESEND_API_KEY` and `EMAIL_FROM` so password-reset OTP emails actually get delivered — see [Password Reset](#-password-reset) for the full setup.

### 4. Initialize the database

```bash
npx prisma migrate dev
```

### 5. Seed demo data

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 👤 Demo Account

A seeded demo account is available for testing:

```text
Email: manager@stocksense.dev
Password: password123
```

---

# 🔑 Password Reset

StockSense uses email-based OTP verification for password recovery, delivered through [Resend](https://resend.com).

```text
Forgot Password
   → Email
   → 6-digit OTP
   → OTP Verification
   → New Password
```

### How it works

1. **Forgot Password** — user enters their registered email on `/forgot-password`.
2. **OTP generated** — a cryptographically secure 6-digit code (`crypto.randomInt`, never `Math.random()`) is created, hashed with bcrypt, and stored against that user with a 10-minute expiry. Only the hash is stored — never the raw code.
3. **Email sent** — the OTP is emailed via Resend, with a subject of *"Your StockSense Password Reset OTP"*.
4. **OTP Verification** — the user enters the code on a dedicated verification step. The server checks the code, expiry, and attempt count independently, without ever accepting the new password in the same request.
5. **New Password** — once verified, the user sets a new password (8+ characters, upper + lower case, one special character). The OTP is single-use and is deleted the moment it's spent, so it can't be replayed.
6. **Back to Login** — the flow ends on a plain success screen with a link back to `/login`; it does **not** auto-sign the user in.

### Security details

* OTPs are single-use, hashed (bcrypt), and expire after 10 minutes.
* Up to 5 verification attempts per OTP — after that it's locked out (even the correct code is rejected) until a new one is requested.
* Resend is rate-limited server-side to one send per 60 seconds per account, independent of the UI's own countdown.
* The forgot-password endpoint always responds identically whether or not the email is registered, so it can't be used to enumerate accounts.
* All auth endpoints (`forgot-password`, `verify-reset-otp`, `reset-password`) are additionally throttled per IP address.

### Environment variables

```env
# Get a free key at https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key

# Must be onboarding@resend.dev unless you've verified your own domain in Resend
EMAIL_FROM="StockSense <onboarding@resend.dev>"
```

### Setting it up

1. Create a free account at [resend.com](https://resend.com) and generate an API key from **API Keys** in the dashboard.
2. Add that key to `.env` as `RESEND_API_KEY`.
3. Sender domain:
   - **Quick start (no domain needed):** leave `EMAIL_FROM` as `StockSense <onboarding@resend.dev>`. Resend's shared sandbox sender works out of the box, but **only delivers to the email address you signed up to Resend with** — fine for solo testing, not for sending to arbitrary users.
   - **To send OTPs to any registered user's real inbox** (required for a live multi-user demo): verify your own domain under **Domains** in the Resend dashboard (add the DNS records they give you), then set `EMAIL_FROM` to an address at that domain, e.g. `StockSense <noreply@yourdomain.com>`.
4. Restart the dev server after editing `.env` — environment variables are only read at process start.
5. Test it: go to `/forgot-password`, enter a registered account's email, and check that inbox (and Spam/Promotions) for the code.

### Development fallback

If `RESEND_API_KEY` is left blank, OTPs are printed to the server console instead of being emailed, clearly marked as `[StockSense][DEV FALLBACK — RESEND_API_KEY not set]`. This exists only so the flow is testable without any setup — it is **not** the intended behavior for a real demo, and the code will never claim an email was sent when it wasn't.

---

# 👥 Team

### Team Members

| Member                | Role                                    |
| --------------------- | --------------------------------------- |
| **Divyadeep**         | Team Lead & Full-Stack Development      |
| **Jashanpreet Singh** | Core Developer & Full-Stack Development |
| **Mukesh Kumar**      | Frontend / UI & Feature Development     |
| **Krishang Khanna**   | Testing, Integration & Documentation    |

### Contribution

**Divyadeep** and **Jashanpreet Singh** worked closely on the core implementation and overall development of StockSense, including application architecture, functionality, and integration.

The remaining team members contributed across frontend development, testing, integration, and project documentation.

> *Update individual role descriptions before submission if your team's actual contributions differ.*

---

# 💡 What Makes StockSense Different?

StockSense is not simply a product database.

It focuses on **inventory movement and visibility**.

Instead of asking only:

> "How many products do we have?"

StockSense helps answer:

> **"What do we have, where is it, what changed, and why?"**

Every receipt, delivery, transfer, and adjustment contributes to a centralized inventory history.

---

# 🔮 Future Scope

Potential future enhancements include:

* Barcode / QR code scanning
* Supplier management
* Purchase order integration
* Sales order integration
* Advanced inventory analytics
* Role-based access control
* Email notifications
* Exportable inventory reports
* Cloud database deployment
* Mobile / PWA support
* AI-assisted demand forecasting

---

# 📌 Project Status

**StockSense is being developed as a modular Inventory Management System for the 2026 hackathon.**

The current implementation focuses on the core inventory lifecycle:

**Products → Receipts → Transfers → Deliveries → Adjustments → Stock Ledger**
