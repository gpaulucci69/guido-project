FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run typecheck
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
CMD ["node", "apps/billing-workflow-service/src/main.ts"]
