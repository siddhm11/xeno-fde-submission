# Xeno FDE Ingestion Service

A multi-tenant data ingestion and insights service designed to connect with Shopify stores, synchronize data (Customers, Products, Orders), and provide real-time analytics via a React dashboard.

## 🚀 Features

- **Multi-Tenancy**: Built from the ground up to support multiple stores with strict data isolation using `tenantId`.
- **Data Ingestion**: Automated synchronization with Shopify APIs (Customers, Products, Orders).
- **Smart Upsert**: Idempotent data handling ensures no duplicates, updating existing records seamlessly.
- **Analytics Dashboard**: Visual insights including Sales Over Time, Top Customers, and key business metrics.
- **Modern Stack**: Built with Node.js, Express, PostgreSQL (Prisma), React, and TailwindCSS.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Services**: Axios (API), Node-Cron (Scheduling)

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Routing**: React Router DOM

## 📂 Folder Structure

```
/
├── client/                 # React Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages (Dashboard)
│   │   └── services/       # API integration service
├── server/                 # Express Backend application
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API route definitions
│   │   └── services/       # Business logic (Shopify Sync)
│   └── prisma/             # Database schema
└── README.md               # Project documentation
```

## ⚙️ Prerequisites

- **Node.js**: v18 or higher (Recommended v20+)
- **PostgreSQL**: A running PostgreSQL database instance.
- **Git**: For version control.

## 🔧 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/xeno-fde-submission.git
    cd xeno-fde-submission
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    ```
    
    a. **Environment Variables**: Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    ```
    *Replace the `DATABASE_URL` with your actual Postgres connection string.*

    b. **Database Migration**:
    ```bash
    npx prisma db push
    ```

3.  **Client Setup**
    ```bash
    cd ../client
    npm install
    ```

## 🚀 Running the Application

You will need to run the backend and frontend in separate terminals.

**Terminal 1: Backend**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## 📡 API Endpoints

### Ingestion
- `POST /api/shopify/connect`: Connect a new Shopify store (creates Tenant).
  - Body: `{ "shopDomain": "...", "accessToken": "..." }`
- `POST /api/sync/:tenantId`: Trigger background data sync.

### Insights
- `GET /api/insights/stats?tenantId=...`: Get aggregate metrics.
- `GET /api/insights/sales-over-time?tenantId=...`: Get daily sales data.
- `GET /api/insights/top-customers?tenantId=...`: Get top spending customers.

## 📝 License

This project is submitted for the Xeno FDE assignment.
