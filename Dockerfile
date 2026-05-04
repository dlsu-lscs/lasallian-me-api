#builder
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY package*.json pnpm-lock.yaml ./ 
RUN pnpm install  --frozen-lockfile
COPY . .
RUN pnpm run build 

#production
FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT:-8000}/health" || exit 1
CMD ["node", "dist/server.js"]
