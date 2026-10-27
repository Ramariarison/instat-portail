# syntax=docker/dockerfile:1
# Image commune aux services NestJS : docker build --build-arg SERVICE=auth services/
#
# Les dépendances ne sont téléchargées qu'une fois (étape « deps », identique pour les 4 services) ;
# le cache npm est conservé entre deux constructions, et npm réessaie en cas de réseau instable.

# 1. Dépendances (toutes, pour compiler).
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline --fetch-retries=5 --fetch-timeout=120000

# 2. Dépendances de production seulement (sans nouveau téléchargement).
FROM deps AS prod-deps
RUN npm prune --omit=dev --no-audit --no-fund

# 3. Compilation (TypeScript → un fichier JavaScript par service, via webpack).
FROM deps AS build
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY libs ./libs
COPY apps ./apps
ARG SERVICE
RUN npx nest build ${SERVICE} && mkdir -p apps/${SERVICE}/migrations

# 4. Exécution : dépendances de production et code compilé seulement.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

ARG SERVICE
COPY --from=build /app/dist/apps/${SERVICE} ./dist
COPY --from=build /app/apps/${SERVICE}/migrations ./migrations
ENV MIGRATIONS_DIR=/app/migrations

RUN mkdir -p /data/files && chown node:node /data/files
USER node

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "dist/main.js"]
