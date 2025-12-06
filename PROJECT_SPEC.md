Project Specification: Xeno FDE Multi-Tenant Ingestion Service
1. Project Overview

Goal: Build a multi-tenant Data Ingestion & Insights Service that connects to Shopify stores, ingests their data (Customers, Orders, Products), and visualizes it on a dashboard. Core Constraint: The system must handle multiple tenants (stores) with strict data isolation. Deployment: The solution must be deployed (Render/Railway/Vercel) and include a video demo.





2. Technology Stack
Monorepo Structure: Client and Server in one repository.


Frontend: React.js (Vite) + TailwindCSS + Recharts (for visualization).



Backend: Node.js + Express.js.


Database: PostgreSQL.


ORM: Prisma (for schema management and multi-tenant handling).


Ingestion: axios for API calls, node-cron for scheduling syncs.

3. Database Schema (Prisma)
Rule: All data tables must include a tenantId to ensure row-level security and isolation.

Code snippet

// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// The Tenant (Shopify Store)
model Tenant {
  id             String   @id @default(uuid())
  shopDomain     String   @unique // e.g., "my-store.myshopify.com"
  accessToken    String   // Encrypted in production, plain for MVP
  createdAt      DateTime @default(now())
  
  // Relations
  orders         Order[]
  customers      Customer[]
  products       Product[]
}

// Data: Orders
model Order {
  id              String   @id @default(uuid())
  shopifyOrderId  String   @unique // The ID from Shopify
  orderNumber     Int
  totalPrice      Float
  currency        String
  createdAt       DateTime // When order was created in Shopify
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])

  customerId      String?
  customer        Customer? @relation(fields: [customerId], references: [id])
}

// Data: Customers
model Customer {
  id                String   @id @default(uuid())
  shopifyCustomerId String   @unique
  email             String?
  firstName         String?
  lastName          String?
  totalSpent        Float    @default(0.0)
  ordersCount       Int      @default(0)
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  
  orders            Order[]
}

// Data: Products
model Product {
  id              String   @id @default(uuid())
  shopifyProductId String   @unique
  title           String
  vendor          String?
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
}
4. Architecture & API Contract
A. Folder Structure
Plaintext

/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Charts, Cards)
│   │   ├── pages/          # Dashboard, Login
│   │   └── services/       # API fetch functions
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── controllers/    # Request Logic
│   │   ├── routes/         # API Routes
│   │   └── services/       # Shopify API & Sync Logic
│   ├── prisma/             # DB Schema
└── README.md               # Documentation
B. Backend API Routes
Ingestion & Auth

POST /api/shopify/connect: Accepts shopDomain and accessToken. Creates a Tenant record.

POST /api/sync/:tenantId: Triggers the background ingestion process for a specific store.

Insights (Dashboard)


GET /api/insights/stats?tenantId=X: Returns Total Customers, Total Orders, Total Revenue.


GET /api/insights/sales-over-time?tenantId=X: Returns aggregated daily sales for the chart.


GET /api/insights/top-customers?tenantId=X: Returns top 5 customers by totalSpent.

5. Implementation Rules for AI Assistant
When generating code for this project, the AI must adhere to the following:

Multi-Tenancy First: Every database query MUST include where: { tenantId: id }. Never query the database without filtering by tenant.

Upsert Strategy: When ingesting data from Shopify, always use upsert (Update if exists, Create if new) to prevent duplicate data entries on subsequent syncs.

Error Handling: All API calls to Shopify must be wrapped in try/catch blocks. If Shopify rate limits are hit, the system should wait or log the error.

Environment Variables: Do not hardcode secrets. Use process.env for Database URLs and API Keys.

Documentation: All complex logic (especially the data transformation from Shopify JSON to Prisma Schema) must be commented.

6. Execution Plan (Next Steps)
Initialize: Set up Monorepo and install dependencies.

Database: Run npx prisma db push to create the tables in PostgreSQL.

Backend Logic: Implement shopifyService.js to fetch data and save to DB.

Frontend: Build the Dashboard using Recharts to visualize the API data.

Deploy: Push to GitHub and deploy to Render/Vercel.