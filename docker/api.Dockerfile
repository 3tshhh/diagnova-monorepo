FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared-types packages/shared-types

RUN pnpm --filter @diagnova/shared-types build
RUN pnpm --filter @diagnova/api build

EXPOSE 3000

CMD ["pnpm", "--filter", "@diagnova/api", "start:prod"]
