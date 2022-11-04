# create node dockerfile
FROM node:16-alpine

RUN apk add --no-cache git
RUN apk add --no-cache libc6-compat


RUN npm install -g pnpm

# create app directory
RUN mkdir -p /app
WORKDIR /app

COPY . .

RUN pnpm install

RUN npx turbo run build --filter=bot

RUN cd ./apps/bot

env NODE_ENV=production

CMD [ "pnpm", "start" ]
