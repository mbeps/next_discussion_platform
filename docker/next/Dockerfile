# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# ---- Release Stage ----
FROM node:20-alpine AS release
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN yarn install
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["yarn", "start"]