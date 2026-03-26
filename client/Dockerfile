# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# VITE_ vars are inlined at build time — pass from Railway build variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ─── Stage 2: Serve with nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
