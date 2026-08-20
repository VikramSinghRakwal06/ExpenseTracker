# 💰 Expense Tracker

A full-stack personal finance application built on the MERN stack. Users register, record income and expense transactions, filter and export them, and analyse their spending through interactive charts — with JWT-authenticated, per-user data isolation throughout.

![Dashboard](docs/screenshots/dashboard-light.png)

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%"><strong>Dashboard</strong><br/><img src="docs/screenshots/dashboard-light.png" alt="Dashboard" /></td>
    <td width="50%"><strong>Dashboard — dark mode</strong><br/><img src="docs/screenshots/dashboard-dark.png" alt="Dashboard in dark mode" /></td>
  </tr>
  <tr>
    <td><strong>Analytics</strong><br/><img src="docs/screenshots/analytics-light.png" alt="Analytics" /></td>
    <td><strong>Analytics — dark mode</strong><br/><img src="docs/screenshots/analytics-dark.png" alt="Analytics in dark mode" /></td>
  </tr>
  <tr>
    <td><strong>Transactions</strong><br/><img src="docs/screenshots/transactions-light.png" alt="Transactions" /></td>
    <td><strong>Transactions — dark mode</strong><br/><img src="docs/screenshots/transactions-dark.png" alt="Transactions in dark mode" /></td>
  </tr>
  <tr>
    <td><strong>Add transaction</strong><br/><img src="docs/screenshots/add-transaction-modal.png" alt="Add transaction modal" /></td>
    <td><strong>Sign in</strong><br/><img src="docs/screenshots/login.png" alt="Sign in screen" /></td>
  </tr>
</table>

<p align="center">
  <strong>Responsive on mobile</strong><br/>
  <img src="docs/screenshots/mobile-dashboard.png" alt="Mobile dashboard" width="300" />
</p>

---

## ✨ Features

| Feature | Description |
| --- | --- |
| **Authentication** | Register / log in with JWT (7-day expiry). Passwords hashed with bcrypt; tokens attached automatically to every request and cleared on expiry. |
| **Transaction management** | Full CRUD — add, edit and delete income/expense records with amount, category, date, payment mode, bank and reference. |
| **Dashboard** | Live total balance, income this month and expenses this month, plus a recent-transactions feed. |
| **Filtering** | Filter by type (income/expense/all) and by period (last week / month / year, or a custom date range). |
| **Analytics** | Category-wise spending pie chart, month-by-month income-vs-expense bar chart, and a ranked "top spending categories" breakdown. |
| **CSV export** | Download the current filtered view from either the Transactions or Analytics page. |
| **Profile & settings** | Update display name, change password (requires current password), toggle theme. |
| **Dark mode** | App-wide, persisted to `localStorage`, defaults to the OS preference, and synced across both Tailwind and Ant Design components. |
| **Responsive** | Mobile navigation drawer, horizontally scrollable tables, fluid grids. |

---

## 🏗️ Architecture

```
ExpenseTracker/
├── Client/                     React SPA (Vite)
│   └── src/
│       ├── api/axios.js        Single axios instance + JWT / 401 interceptors
│       ├── components/         Layout, route guards, theme bridge, shared UI
│       ├── constants/          Category & payment-mode option lists
│       ├── context/            Auth + Theme state (Context API)
│       ├── pages/              One component per route (lazy-loaded)
│       └── utils/              Currency formatting
├── Server/                     Express REST API
│   ├── app.js                  Express app (exported for tests)
│   ├── server.js               Env validation, DB connect, listen
│   ├── config/connectDB.js     Mongoose connection
│   ├── controllers/            Request handlers
│   ├── middleware/             JWT auth guard + express-validator rules
│   ├── models/                 Mongoose schemas
│   ├── routes/                 Route definitions
│   └── __tests__/              Jest + Supertest integration tests
└── docs/screenshots/           Images used by this README
```

`app.js` is deliberately separate from `server.js` so the test suite can import the Express app without opening a port or connecting to the real database.

---

## 🔄 How it works

### System overview

```mermaid
flowchart LR
    subgraph Browser["Browser — React SPA"]
        direction TB
        Pages["Pages<br/>Dashboard · Transactions · Analytics<br/>Profile · Settings"]
        Guards["Route guards<br/>ProtectedRoute / PublicOnlyRoute"]
        Ctx["Context<br/>Auth · Theme"]
        Http["axios instance<br/>attaches JWT · handles 401"]
        Guards --> Pages
        Pages --> Ctx
        Pages --> Http
    end

    subgraph API["Node.js — Express REST API"]
        direction TB
        Mw["Middleware<br/>helmet · cors · rate limit<br/>validation · JWT guard"]
        Ctrl["Controllers<br/>user · transaction"]
        Models["Mongoose models"]
        Mw --> Ctrl --> Models
    end

    DB[("MongoDB<br/>users · transactions")]

    Http -->|"Authorization: Bearer token"| Mw
    Models --> DB
```

### Authentication — how a session starts

```mermaid
sequenceDiagram
    actor User
    participant Client as React Client
    participant Axios as axios instance
    participant API as Express API
    participant DB as MongoDB

    User->>Client: submits email + password
    Client->>Axios: POST /users/login
    Axios->>API: request
    API->>API: rate limit — 20 attempts / 15 min
    API->>API: validate payload
    API->>DB: findOne by email
    DB-->>API: user document
    API->>API: bcrypt.compare(password, hash)
    API->>API: jwt.sign({ userId }) — expires in 7d
    API-->>Axios: 200 { token, user }
    Axios-->>Client: response
    Client->>Client: AuthProvider saves token + user
    Client-->>User: redirect to Dashboard

    Note over API: A wrong email and a wrong password<br/>return the same 401, so the API never<br/>reveals which accounts exist.
```

### Authorization — how every later request is scoped

```mermaid
sequenceDiagram
    participant Client as React Client
    participant Axios as axios instance
    participant Guard as JWT guard
    participant Ctrl as Controller
    participant DB as MongoDB

    Client->>Axios: request a protected endpoint
    Axios->>Axios: interceptor attaches the stored token
    Axios->>Guard: Authorization: Bearer token

    alt token valid
        Guard->>Guard: jwt.verify sets req.userId
        Guard->>Ctrl: next()
        Ctrl->>DB: query filtered by req.userId
        Note over Ctrl,DB: Ownership comes from the verified token.<br/>A userid in the request body is ignored,<br/>and writes match on { _id, userid }.
        DB-->>Ctrl: only this user's records
        Ctrl-->>Axios: 200 data
    else token missing or expired
        Guard-->>Axios: 401 Unauthorized
        Axios->>Axios: interceptor clears the session
        Axios-->>Client: redirect to /login
    end
```

### Request pipeline

```mermaid
flowchart TD
    Req["Incoming request"] --> Helmet["helmet — security headers"]
    Helmet --> Cors["cors — restricted to CLIENT_URL"]
    Cors --> Json["express.json — parse body"]
    Json --> Router{"Which route?"}

    Router -->|"/users/login · /users/register"| Limit["rate limiter"]
    Router -->|"/transactions/* · /users/profile"| Auth["JWT guard"]

    Limit --> Valid["express-validator"]
    Auth --> Valid
    Valid -->|"invalid"| Err400["400 with the first error"]
    Valid -->|"valid"| Controller["Controller"]
    Auth -->|"bad token"| Err401["401 Unauthorized"]

    Controller <-->|"query · result"| Mongo[("MongoDB")]
    Controller --> Ok["2xx JSON response"]
    Controller -->|"throws"| Handler["Central error handler"]
```

### Navigation and route guards

```mermaid
flowchart LR
    Visitor(["Visitor"]) --> Check{"Signed in?"}
    Check -->|"No"| Public["/login · /register"]
    Check -->|"Yes"| Private["/ · /transactions · /analytics<br/>/profile · /settings"]
    Public -->|"login or register succeeds"| Private
    Private -->|"sign out, or a 401 from the API"| Public
    Visitor -->|"unknown URL"| NotFound["404 page"]
```

---

## 🛠️ Tech stack — what's used and where

### Frontend

| Technology | Where it's used | Why |
| --- | --- | --- |
| **React 19** | Whole SPA | Component model + hooks for local and shared state. |
| **Vite 6** | Build tooling, dev server | Fast HMR; its dev proxy forwards `/api` to the backend so there are no CORS issues locally. |
| **React Router 7** | `App.jsx` | Client-side routing, route guards (`ProtectedRoute` / `PublicOnlyRoute`), 404 catch-all. |
| **Context API** | `context/AuthProvider`, `context/ThemeProvider` | Shares the signed-in user and theme without prop-drilling. Chosen over Redux — the app has little global state, so Redux would be overhead. |
| **Axios** | `api/axios.js` | One configured instance; a request interceptor attaches the JWT and a response interceptor force-logs-out on `401`. |
| **Tailwind CSS 4** | All layout and styling | Utility-first styling; dark mode driven by a `.dark` class on `<html>` via a `@custom-variant`. |
| **Ant Design 5** | Table, Modal, Form, Select, DatePicker | Production-grade complex widgets (sorting, pagination, validation) that would be slow to hand-roll. `AntdThemeProvider` keeps its tokens in sync with the app theme. |
| **Recharts** | `pages/Analytics.jsx` | Declarative, composable React charts (pie + bar). |
| **Lucide React** | Icons throughout | Lightweight, consistent icon set. |
| **Day.js** | Date parsing/formatting everywhere | Much smaller than Moment (which was removed) and it's what Ant Design's DatePicker already uses. |
| **React Hot Toast** | Success/error feedback | Non-blocking notifications. |
| **PapaParse + FileSaver** | CSV export | Serialises transactions and triggers the browser download. |
| **ESLint 9** | `npm run lint` | Flat config with React, Hooks and Fast-Refresh rules. |

### Backend

| Technology | Where it's used | Why |
| --- | --- | --- |
| **Node.js + Express 4** | `app.js`, `routes/` | Minimal, well-understood REST layer. |
| **MongoDB + Mongoose 8** | `models/` | Flexible document store; Mongoose adds schema validation and a compound index on `{ userid, date }`. |
| **jsonwebtoken** | `controllers/userController.js`, `middleware/authMiddleware.js` | Stateless auth — the server needn't store sessions. |
| **bcryptjs** | `controllers/userController.js` | Salted password hashing (10 rounds). Chosen over `bcrypt` because it's pure JS — no native build step and no vulnerable install-time dependencies. |
| **express-validator** | `middleware/validators.js` | Declarative request validation before anything reaches a controller. |
| **helmet** | `app.js` | Sets hardening HTTP headers. |
| **express-rate-limit** | `routes/userRoute.js` | Caps login/register at 20 attempts per 15 min per IP to blunt brute-force attacks. |
| **cors** | `app.js` | Restricted to `CLIENT_URL` rather than wide open. |
| **morgan** | `app.js` | Request logging (disabled during tests). |
| **Jest + Supertest + mongodb-memory-server** | `__tests__/` | Integration tests hit real routes against a throwaway in-memory MongoDB, so they never touch production data. |

---

## 🔐 Security

- **Per-user data isolation.** Transaction ownership is derived from the verified JWT (`req.userId`), never from the request body. Update and delete queries match on `{ _id, userid }`, so one user cannot read or modify another's records even by supplying someone else's ID. This is covered by regression tests.
- **Password hashing.** bcrypt with a per-password salt; hashes are never returned by any endpoint.
- **No user enumeration.** Wrong email and wrong password both return the same generic `401`.
- **Input validation** on every write endpoint via express-validator.
- **Rate limiting** on the authentication endpoints.
- **Secrets stay out of git** — `.env` is git-ignored; use `.env.example` as the template.

> **Note on `npm audit`:** a small number of advisories remain in the frontend's *development* dependencies (the ESLint tool-chain) and in `react-router`, whose only reported issue affects React Server Components — a feature this SPA does not use, and for which no patched release exists. Nothing shipped to the browser or the server is affected.

---

## 📦 Getting started

### Prerequisites
- Node.js 18+
- A MongoDB database (local, or a free MongoDB Atlas cluster)

### 1. Clone and install
```bash
git clone https://github.com/VikramSinghRakwal06/ExpenseTracker.git
cd ExpenseTracker

npm install                 # root (concurrently)
npm install --prefix Server
npm install --prefix Client
```

### 2. Configure the backend
```bash
cp Server/.env.example Server/.env
```

Fill in `Server/.env`:

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `9090`). |
| `MONGODB_URL` | Your MongoDB connection string. |
| `JWT_SECRET` | Long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `CLIENT_URL` | Frontend origin for CORS (`http://localhost:5173` in development). |

The server refuses to start if `MONGODB_URL` or `JWT_SECRET` is missing.

### 3. Configure the frontend (optional in development)
```bash
cp Client/.env.example Client/.env
```
Leave `VITE_API_URL` empty locally — Vite's dev proxy forwards `/api` to the backend. For a deployed build, set it to your API's public URL (e.g. `https://your-api.onrender.com/api/v1`).

### 4. Run
```bash
npm run dev        # starts API (:9090) and client (:5173) together
```

Open <http://localhost:5173>.

### Other commands
```bash
npm test                        # backend test suite
npm run build                   # production frontend build
npm run lint --prefix Client    # lint the frontend
```

---

## 🔌 API reference

Base URL: `/api/v1`. Endpoints marked 🔒 require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check. |
| `POST` | `/users/register` | Create an account. Returns a JWT and the user. |
| `POST` | `/users/login` | Authenticate. Returns a JWT and the user. |
| `PATCH` | `/users/profile` 🔒 | Update the display name. |
| `PATCH` | `/users/password` 🔒 | Change password (requires the current one). |
| `POST` | `/transactions/get-transactions` 🔒 | List the caller's transactions, optionally filtered by `type`, `frequency` or a custom `selectedDate` range. |
| `POST` | `/transactions/add-transaction` 🔒 | Create a transaction. |
| `PUT` | `/transactions/update-transaction/:id` 🔒 | Update a transaction the caller owns. |
| `DELETE` | `/transactions/delete-transaction/:id` 🔒 | Delete a transaction the caller owns. |

---

## 🧪 Testing

```bash
npm test
```

Jest + Supertest run against an in-memory MongoDB instance. Coverage includes registration and login (including validation failures and the generic-error path), the authentication guard, transaction CRUD, and explicit regression tests proving one user cannot read, update or delete another user's transactions.

---

## 🚀 Deployment notes

- **Backend** (Render / Railway / Fly): set `MONGODB_URL`, `JWT_SECRET`, `CLIENT_URL` and `NODE_ENV=production`; start with `npm start`.
- **Frontend** (Vercel / Netlify): build with `npm run build`, publish `Client/dist`, and set `VITE_API_URL` to the deployed API base URL. Add a SPA rewrite (all paths → `/index.html`) so client-side routes resolve on refresh.

---

## 📄 License

ISC — see the repository for details.
