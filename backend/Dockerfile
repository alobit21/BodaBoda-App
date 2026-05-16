FROM node:20-slim AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
# We need openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY prisma ./prisma/
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Runner
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
