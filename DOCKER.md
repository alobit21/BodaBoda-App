# 🐳 BodaConnect — Docker Deployment Documentation

**Project:** BodaConnect (BodaBoda Ride-Hailing App)  
**Author:** codewithmac  
**Docker Hub:** [hub.docker.com/u/codewithmac](https://hub.docker.com/u/codewithmac)  
**Database:** Neon PostgreSQL (Cloud)  
**Stack:** Next.js 15, Prisma ORM, Express.js, PostgreSQL

---

## 📐 Architecture Overview

The BodaConnect application was containerized into a **three-service architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (boda-network)            │
│                                                              │
│  ┌────────────────────┐    ┌────────────────────────────┐   │
│  │  bodaboda-frontend │    │    bodaboda-backend         │   │
│  │  (Next.js App)     │    │    (Express API)            │   │
│  │  Port: 3000        │    │    Port: 4000               │   │
│  │                    │    │                             │   │
│  │  - UI Pages        │    │  - REST API                 │   │
│  │  - API Routes (/api│    │  - Prisma ORM               │   │
│  │  - Prisma Client   │    │  - JWT Auth                 │   │
│  └────────┬───────────┘    └──────────┬──────────────────┘   │
│           │                           │                      │
│           └──────────┬────────────────┘                      │
│                      │                                       │
│           ┌──────────▼──────────────┐                        │
│           │    bodaboda-db          │                        │
│           │    (PostgreSQL 15)      │                        │
│           │    Port: 5433 → 5432    │                        │
│           └─────────────────────────┘                        │
│                      │                                       │
│           ┌──────────▼──────────────┐                        │
│           │  Neon PostgreSQL (Cloud) │  ← Production DB      │
│           │  (BodaBodaApp database) │                        │
│           └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project File Structure

```
bodaboda-app/
├── Dockerfile                   # Frontend (Next.js Unified App)
├── docker-compose.yml           # Multi-service orchestration
├── package.json                 # Root dependencies (incl. Prisma, bcryptjs, jwt)
├── prisma/
│   └── schema.prisma            # Database schema (User, Trip, RiderProfile)
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API Routes (backend-in-one)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   └── trips/
│   │   │       ├── available/route.ts
│   │   │       ├── request/route.ts
│   │   │       └── [id]/accept/route.ts
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx   # Rider Dashboard
│   │   ├── request-ride/page.tsx
│   │   └── admin/page.tsx       # Admin Command Center
│   └── utils/
│       ├── api.ts               # Frontend fetch wrapper
│       └── prisma.ts            # Prisma singleton client
├── backend/                     # Standalone Express backend
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── index.ts             # Express app (auth + trips endpoints)
└── db/
    └── Dockerfile               # Custom PostgreSQL image
```

---

## 🏗️ Phase 1: Frontend Containerization

### The Problem
The project is stored on an **external NTFS drive** (`/media/tarxemo/TarXemo/...`). Docker daemon runs as root and does not have read permissions on external drives. Running `docker build .` directly fails with:

```
permission denied
```

### The Solution — Tar Pipe Build
Instead of pointing Docker at the directory directly, we stream the build context through `tar`:

```bash
tar -cz --exclude='.next' --exclude='node_modules' . | docker build -t bodaboda-frontend -f Dockerfile -
```

This bypasses the permission issue by piping the context as a stream to Docker's stdin.

---

### Frontend Dockerfile — Multi-Stage Build

The frontend uses a **3-stage multi-stage build** to minimize the final image size:

```dockerfile
# Stage 1: deps — Install only production dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install

# Stage 2: builder — Compile TypeScript & Build Next.js
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apt-get update && apt-get install -y openssl    # Required for Prisma
RUN npx prisma generate                             # Generate Prisma client
RUN npm run build                                   # Next.js production build

# Stage 3: runner — Minimal production image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apt-get update && apt-get install -y openssl    # Prisma needs libssl at runtime
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Key Decisions:**
> - `node:20-slim` is used to keep image size small (avoids ~500MB full node image).
> - OpenSSL is installed in **both** the builder and runner stages — the builder needs it to generate the Prisma client, the runner needs it to load the Prisma query engine at runtime.
> - The `nextjs` system user (non-root) runs the app for security best practices.
> - `standalone` output mode (configured in `next.config.js`) produces a self-contained bundle — no need to copy `node_modules` to the runner.

---

## 🏗️ Phase 2: Backend Containerization

The backend is a **standalone Express.js API** built with TypeScript. It connects to the same Neon PostgreSQL database.

### Backend Dockerfile

```dockerfile
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install             # postinstall runs: prisma generate

COPY . .
RUN npm run build           # Compile TypeScript → dist/

# Runner stage
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["npm", "start"]
```

### Build Command
```bash
cd backend && tar -cz . | docker build -t bodaboda-backend -f Dockerfile -
```

### Run Command (with Neon DB)
```bash
docker run -d \
  --name bodaboda-backend \
  --network boda-network \
  -e DATABASE_URL="your_neon_connection_string" \
  -e JWT_SECRET="your_secret_key" \
  -p 4000:4000 \
  bodaboda-backend \
  sh -c "npx prisma db push && npm start"
```

> **Note:** `npx prisma db push` syncs the schema to Neon on every startup. In production, you would use `prisma migrate deploy` instead.

---

## 🏗️ Phase 3: Database Containerization

A custom PostgreSQL image was created for local development and to have a branded image on Docker Hub.

### Database Dockerfile (`db/Dockerfile`)

```dockerfile
FROM postgres:15-alpine

ENV POSTGRES_DB=bodaboda
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password

LABEL maintainer="codewithmac"
LABEL description="BodaConnect PostgreSQL Database"

EXPOSE 5432
```

### Build & Push
```bash
cd db && tar -cz . | docker build -t codewithmac/bodaboda-db:latest -f Dockerfile -
docker push codewithmac/bodaboda-db:latest
```

> **Production Note:** The local `bodaboda-db` container is for development only. Production uses **Neon PostgreSQL** (cloud-hosted), which requires no container.

---

## 🏗️ Phase 4: Unified App (Vercel-Ready Architecture)

To support **Vercel deployment**, the Express backend was eliminated as a separate service. Its logic was migrated into **Next.js API Routes** (`src/app/api/`), creating a single unified container.

### API Routes Created

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | `POST` | Create a new user account |
| `/api/auth/login` | `POST` | Authenticate and get JWT token |
| `/api/trips/request` | `POST` | Submit a new ride request (guest-friendly) |
| `/api/trips/available` | `GET` | List rides with SEARCHING status |
| `/api/trips/[id]/accept` | `PATCH` | Rider accepts a specific trip |

### Why This Architecture?
- Vercel does **not support** long-running servers (like Express).
- Next.js API routes compile to **serverless functions** on Vercel — perfect for this use case.
- Single deployment, single container, same database.

---

## 🔌 Database Schema (Prisma)

```prisma
enum Role {
  CUSTOMER
  RIDER
  ADMIN
}

enum TripStatus {
  SEARCHING
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model User {
  id           String        @id @default(uuid())
  phone        String        @unique
  password     String        @default
  name         String?
  role         Role          @default(CUSTOMER)
  riderProfile RiderProfile?
  trips        Trip[]        @relation("CustomerTrips")
}

model RiderProfile {
  id          String  @id @default(uuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])
  plateNumber String  @unique
  rating      Float   @default(5.0)
  isOnline    Boolean @default(false)
  trips       Trip[]  @relation("RiderTrips")
}

model Trip {
  id             String       @id @default(uuid())
  customerId     String?
  customer       User?        @relation("CustomerTrips", ...)
  riderId        String?
  rider          RiderProfile? @relation("RiderTrips", ...)
  guestName      String?      # Guest users (no login required)
  guestPhone     String?
  pickupLocation String
  destination    String
  price          Decimal
  status         TripStatus   @default(SEARCHING)
  createdAt      DateTime     @default(now())
}
```

---

## 🌐 Docker Hub Images

| Image | Tag | Description |
|---|---|---|
| `codewithmac/bodaboda-frontend` | `latest` | Unified Next.js App (Frontend + API Routes) |
| `codewithmac/bodaboda-backend` | `latest` | Standalone Express.js API |
| `codewithmac/bodaboda-db` | `latest` | Custom PostgreSQL 15 image |

---

## 🚀 Running the Full Stack

### Option 1: Docker Compose (Recommended)

```bash
# Pull all images from Docker Hub
docker pull codewithmac/bodaboda-frontend:latest
docker pull codewithmac/bodaboda-backend:latest
docker pull codewithmac/bodaboda-db:latest

# Start all services
docker-compose up -d
```

### Option 2: Manual (no docker-compose)

```bash
# Step 1: Create a shared network
docker network create boda-network

# Step 2: Start the database
docker run -d \
  --name bodaboda-db \
  --network boda-network \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bodaboda \
  -p 5433:5432 \
  codewithmac/bodaboda-db:latest

# Step 3: Start the backend (wait ~5s for DB to be ready)
sleep 5
docker run -d \
  --name bodaboda-backend \
  --network boda-network \
  -e DATABASE_URL="your_neon_or_local_db_url" \
  -e JWT_SECRET="your_secret_key" \
  -p 4000:4000 \
  codewithmac/bodaboda-backend:latest \
  sh -c "npx prisma db push && npm start"

# Step 4: Start the frontend app
docker run -d \
  --name bodaboda-app \
  --network boda-network \
  -e DATABASE_URL="your_neon_or_local_db_url" \
  -e JWT_SECRET="your_secret_key" \
  -p 3000:3000 \
  codewithmac/bodaboda-frontend:latest
```

### Access
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Database (local) | localhost:5433 |

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon or local) |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `NODE_ENV` | Optional | `production` or `development` |
| `NEXT_PUBLIC_API_URL` | Optional | Defaults to `/api` for same-origin calls |

### Neon Connection String Format
```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&channel_binding=require
```

---

## ☁️ Deploying to Vercel

The unified `bodaboda-frontend` image is designed for Vercel deployment:

1. Push your code to **GitHub**
2. Import the project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel Dashboard:
   - `DATABASE_URL` → Your Neon connection string
   - `JWT_SECRET` → Your secret key
4. Deploy — Vercel auto-detects Next.js and runs the build

> Vercel automatically handles `prisma generate` via the `postinstall` script in `package.json`.

---

## 🐛 Known Issues & Fixes

### 1. Permission Denied on External Drive
**Symptom:** `open /media/.../docker-compose.yml: permission denied`  
**Cause:** Docker daemon (runs as root) can't access files on NTFS external drives.  
**Fix:** Use tar pipe to stream build context:
```bash
tar -cz --exclude='.next' --exclude='node_modules' . | docker build -t IMAGE_NAME -f Dockerfile -
```

### 2. Prisma `libssl` Error at Runtime
**Symptom:** `Unable to require libquery_engine-debian-openssl-1.1.x.so.node`  
**Cause:** OpenSSL not installed in the production runner image.  
**Fix:** Add to runner stage in Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
```

### 3. `prisma/schema.prisma not found` During `npm install`
**Symptom:** `postinstall` script fails — prisma generate runs before schema is copied.  
**Fix:** Copy the `prisma/` directory **before** running `npm install`:
```dockerfile
COPY prisma ./prisma/
RUN npm install
```

### 4. Next.js 15 Route Handler Type Error
**Symptom:** `Type "{ params: { id: string } }" is not a valid type for the function's second argument`  
**Cause:** Next.js 15 changed route params to be async Promises.  
**Fix:**
```typescript
// Before (Next.js 14)
export async function PATCH(req, { params }: { params: { id: string } }) {
  const { id } = params;
}

// After (Next.js 15)
export async function PATCH(req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### 5. No Space Left on Device
**Symptom:** `write .docker/buildx/activity/.tmp: no space left on device`  
**Fix:** Clean up Docker build cache:
```bash
docker system prune -f
```

---

## 🔑 User Roles & Authentication

| Role | Login Required | Default Route After Login |
|---|---|---|
| `ADMIN` | ✅ Yes | `/admin` (Command Center) |
| `RIDER` | ✅ Yes | `/dashboard` (Ride Requests) |
| `CUSTOMER` | ❌ No | `/request-ride` (Guest form) |

- Customers can request rides **without registering** — they provide name and phone in the form.
- Riders and Admins authenticate via JWT stored in `localStorage`.

---

*Documentation generated: May 2026 | BodaConnect v1.0*
