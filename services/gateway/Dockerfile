# Contexte de build : la racine du dépôt (le front est construit ici, sans être modifié).
FROM node:24-alpine AS front
WORKDIR /front
COPY instat-front-v2/package.json instat-front-v2/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY instat-front-v2/ ./
# Comptes de démonstration dans la fenêtre de connexion : seulement si les services ont été initialisés avec SEED_DEMO=true.
ARG VITE_SHOW_DEMO_ACCOUNTS=false
ENV VITE_SHOW_DEMO_ACCOUNTS=${VITE_SHOW_DEMO_ACCOUNTS}
RUN npm run build

FROM nginx:1.28-alpine
ENV CORS_ORIGIN=""
COPY services/gateway/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=front /front/dist /usr/share/nginx/html
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/api/health >/dev/null || exit 1
