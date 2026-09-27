# Multi-stage Dockerfile for Frontend (Vite + Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

RUN npm ci

COPY shared/ ./shared/
COPY frontend/ ./frontend/

RUN npm run build --workspace=shared
RUN npm run build --workspace=frontend

# Production Nginx Server
FROM nginx:1.27-alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
