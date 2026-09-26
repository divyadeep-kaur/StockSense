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
* OTP-based password reset
* Protected application routes

If SMTP is not configured, password-reset OTPs are logged to the server console for development purposes.

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

# 🔑 Password Reset OTP

If `SMTP_HOST` is left blank in `.env`, OTP codes are printed to the server console instead of being sent by email.

This allows the password-reset functionality to be tested without configuring an external mail server.

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
