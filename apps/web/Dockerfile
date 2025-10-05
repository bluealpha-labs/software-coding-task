# Stage 1: Base Image
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Pruner
FROM base AS pruner
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/pnpm/metadata-cache \
    pnpm add -g turbo

COPY . .
RUN turbo prune web --docker

# Stage 3: Installer
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/pnpm/metadata-cache \
    pnpm fetch

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/pnpm/metadata-cache \
    pnpm install -r --offline

# Stage 4: Builder
FROM installer AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=pruner /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,id=turbo,target=.turbo \
    pnpm turbo run build --filter=web...

# Stage 5: Production Runtime
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
USER nonroot

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["apps/web/server.js"]