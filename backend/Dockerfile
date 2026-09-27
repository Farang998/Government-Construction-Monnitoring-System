# Multi-stage Dockerfile for Backend API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package descriptors
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci

# Copy sources
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared library & backend
RUN npm run build --workspace=shared
RUN npm run prisma:generate --workspace=backend
RUN npm run build --workspace=backend

# Production Runner stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

RUN npm ci --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Non-root secure execution
RUN addgroup -S govgroup && adduser -S govuser -G govgroup
USER govuser

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
