FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/packages/db
RUN npx prisma generate
WORKDIR /app/apps/backend
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/.next/standalone ./
COPY --from=builder /app/apps/backend/.next/static ./apps/backend/.next/static
COPY --from=builder /app/packages/db/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000
ENV PORT 4000
CMD ["node", "apps/backend/server.js"]
