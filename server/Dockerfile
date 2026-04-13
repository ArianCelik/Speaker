
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./

RUN bun install --production

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY package.json ./
COPY server.js ./
COPY database.js ./

EXPOSE 3000

CMD ["bun", "run", "server.js"]
