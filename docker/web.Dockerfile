FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

ARG VITE_API_BASE_URL=https://api.diagnova.duckdns.org/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY packages/shared-types packages/shared-types

RUN pnpm --filter @diagnova/web build

FROM nginx:1.27-alpine

COPY ngnix/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
