# Image commune aux services Node : `docker build --build-arg SERVICE=auth services/`
# Node 24 exécute directement le TypeScript (suppression des types) : pas d'étape de compilation.
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY shared ./shared
ARG SERVICE
COPY ${SERVICE} ./${SERVICE}
ENV SERVICE=${SERVICE}

RUN mkdir -p /data/files && chown node:node /data/files
USER node

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["sh", "-c", "exec node ${SERVICE}/src/server.ts"]
