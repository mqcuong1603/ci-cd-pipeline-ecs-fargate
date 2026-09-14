# Builder Stage
FROM node:22 AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --omit=dev


# Runtime Stage
FROM node:22-slim AS runtime

ARG APP_VERSION=dev
ARG GIT_COMMIT=unknown

ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    GIT_COMMIT=${GIT_COMMIT} \
    PORT=3000

WORKDIR /opt/app

COPY --chown=node:node --from=builder /build/node_modules ./node_modules
COPY --chown=node:node --from=builder /build/dist ./dist
COPY --chown=node:node --from=builder /build/package*.json ./

EXPOSE 3000

USER node

CMD ["node", "dist/server.js"]