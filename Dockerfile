FROM node:22-alpine

LABEL org.opencontainers.image.title="EstuLanches" \
      org.opencontainers.image.version="1.0.0"

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public
COPY tests ./tests

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
    CMD wget -qO- http://localhost:3000/saude || exit 1

CMD ["node", "src/server.js"]
