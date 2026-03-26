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

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
        access_log off;\n\
    }\n\
\n\
    location = /index.html {\n\
        add_header Cache-Control "no-store, no-cache, must-revalidate";\n\
    }\n\
\n\
    location = /health {\n\
        access_log off;\n\
        return 200 "ok";\n\
        add_header Content-Type text/plain;\n\
    }\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;\n\
    gzip_min_length 1024;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
