FROM node:20-alpine AS base

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml ./
COPY packages/ packages/
COPY turbo.json ./

# Copy specific service
ARG SERVICE
COPY apps/${SERVICE}/ apps/${SERVICE}/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm turbo build --filter=@algoarena/${SERVICE}

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

ARG SERVICE
COPY --from=builder /app/apps/${SERVICE}/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER node

CMD ["node", "dist/server.js"]
