FROM oven/bun:1.4 AS base
WORKDIR /app
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/api apps/api

FROM oven/bun:1.4-slim
WORKDIR /app
COPY --from=base /app /app
ENV NODE_ENV=production
EXPOSE 3000
# Migration'ları başlangıçta uygula, sonra API'yi başlat
CMD ["sh", "-c", "bun run packages/db/src/migrate.ts && bun run apps/api/src/index.ts"]
