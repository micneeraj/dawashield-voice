# DawaShield: build the PWA in one stage, then serve only the built files from a small nginx image.
# No API keys are needed. Optional public build values come from docker-compose (empty = not set).

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_RECAPTCHA_SITE_KEY=""
ARG VITE_APPCHECK_DEBUG_TOKEN=""
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY \
    VITE_APPCHECK_DEBUG_TOKEN=$VITE_APPCHECK_DEBUG_TOKEN
RUN npm run build

FROM nginx:1.27-alpine AS serve
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["sh", "-c", "echo 'DawaShield is running at http://localhost:3000' && exec nginx -g 'daemon off;'"]
