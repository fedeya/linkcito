# create node dockerfile
FROM node:16-slim

RUN apt-get update
RUN apt-get install -y openssl git libc6

RUN npm install -g pnpm

# create app directory
RUN mkdir -p /app
WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile --filter=bot 

RUN npx turbo run build --filter=bot
RUN pnpm generate

WORKDIR /app/apps/bot

ENV NODE_ENV=production

CMD cd ../../packages/db && pnpm run db:migrate:deploy; cd ../../apps/bot && pnpm start
