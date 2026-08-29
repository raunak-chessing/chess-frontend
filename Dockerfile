FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js inlines NEXT_PUBLIC_* values into the client bundle at build time,
# not runtime — these must be build args, not just container env vars.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GAMESERVER_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GAMESERVER_URL=$NEXT_PUBLIC_GAMESERVER_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# See chessbackend/Dockerfile for why this is needed — V8's default heap
# ceiling is based on physical RAM alone, not physical+swap, and Next.js's
# build is typically even more memory-hungry than a NestJS tsc build.
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN pnpm run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
