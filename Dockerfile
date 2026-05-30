FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_SENTRY_DSN
ARG VITE_WEATHER_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_WEATHER_API_KEY=$VITE_WEATHER_API_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Security headers for the SPA shell. The backend emits its own CSP on API
# responses; this one covers the HTML / static assets that nginx serves.
RUN echo 'server { \
    listen 80; \
    add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\'' https://www.googletagmanager.com https://www.google-analytics.com; style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src '\''self'\'' data: https:; font-src '\''self'\'' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src '\''self'\'' https://api.minhojan-world.site https://*.minhojan-world.site https://www.google-analytics.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io; frame-ancestors '\''none'\''; base-uri '\''none'\''; form-action '\''self'\''" always; \
    add_header X-Frame-Options "DENY" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer" always; \
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always; \
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always; \
    root /usr/share/nginx/html; \
    index index.html; \
    # Hashed assets: if missing, return a real 404 instead of falling through \
    # to index.html. Falling through causes the browser to receive HTML when \
    # it expected JS/CSS, which trips strict MIME checks and breaks the SPA \
    # for any user still on an old tab after a redeploy. \
    location ^~ /assets/ { \
        try_files $uri =404; \
    } \
    # Everything else: SPA fallback to index.html for client-side routing. \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
