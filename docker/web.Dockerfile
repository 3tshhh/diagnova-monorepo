FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

ARG VITE_API_BASE_URL=https://api.diagnova.duckdns.org/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ARG VITE_TEAM_1_LINKEDIN=
ARG VITE_TEAM_1_PHOTO=
ARG VITE_TEAM_2_LINKEDIN=
ARG VITE_TEAM_2_PHOTO=
ARG VITE_TEAM_3_LINKEDIN=
ARG VITE_TEAM_3_PHOTO=
ARG VITE_TEAM_4_LINKEDIN=
ARG VITE_TEAM_4_PHOTO=
ARG VITE_TEAM_5_LINKEDIN=
ARG VITE_TEAM_5_PHOTO=
ARG VITE_TEAM_6_LINKEDIN=
ARG VITE_TEAM_6_PHOTO=

ENV VITE_TEAM_1_LINKEDIN=${VITE_TEAM_1_LINKEDIN}
ENV VITE_TEAM_1_PHOTO=${VITE_TEAM_1_PHOTO}
ENV VITE_TEAM_2_LINKEDIN=${VITE_TEAM_2_LINKEDIN}
ENV VITE_TEAM_2_PHOTO=${VITE_TEAM_2_PHOTO}
ENV VITE_TEAM_3_LINKEDIN=${VITE_TEAM_3_LINKEDIN}
ENV VITE_TEAM_3_PHOTO=${VITE_TEAM_3_PHOTO}
ENV VITE_TEAM_4_LINKEDIN=${VITE_TEAM_4_LINKEDIN}
ENV VITE_TEAM_4_PHOTO=${VITE_TEAM_4_PHOTO}
ENV VITE_TEAM_5_LINKEDIN=${VITE_TEAM_5_LINKEDIN}
ENV VITE_TEAM_5_PHOTO=${VITE_TEAM_5_PHOTO}
ENV VITE_TEAM_6_LINKEDIN=${VITE_TEAM_6_LINKEDIN}
ENV VITE_TEAM_6_PHOTO=${VITE_TEAM_6_PHOTO}

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
