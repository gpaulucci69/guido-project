FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate --schema packages/database/prisma/schema.prisma
RUN npm run typecheck
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
CMD ["node", "apps/billing-workflow-service/src/main.ts"]
