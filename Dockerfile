# create node dockerfile
FROM node:16-slim

# install dependencies for prisma and turborepo

RUN apt-get update
RUN apt-get install -y openssl git libc6

RUN npm install -g pnpm

# create app directory
RUN mkdir -p /app
WORKDIR /app

# fetch dependencies for generate cache

COPY pnpm-lock.yaml ./

RUN pnpm fetch

# copy source code

ADD . ./

# install dependencies offline with cache of pnpm fetch

RUN pnpm install -r --offline --frozen-lockfile

# build bot

RUN npx turbo run build --filter=bot
RUN pnpm generate

WORKDIR /app/apps/bot

ENV NODE_ENV=production

# run bot
CMD cd ../../packages/db && pnpm run db:migrate:deploy; cd ../../apps/bot && pnpm start
