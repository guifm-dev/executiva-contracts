FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

RUN npx prisma generate

COPY . .

# RUN npm run build && ls -la dist/
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL npx prisma migrate deploy && DATABASE_URL=$DATABASE_URL npx prisma db seed && node dist/src/main"]
