import Redis from 'ioredis';

declare global {
  var redis: Redis;
}

export let cache: Redis;

if (global.redis) {
  cache = global.redis;
} else {
  global.redis = new Redis(process.env.REDIS_URL as string);
  cache = global.redis;
}
