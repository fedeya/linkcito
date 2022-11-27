import Redis from 'ioredis';
import LRU from 'lru-cache';

declare global {
  var __cache: CacheProvider;
}

interface CacheProvider {
  get<Value>(key: string): Promise<Value | null | undefined>;
  set<Value>(key: string, value: Value, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

export let cache: CacheProvider;

if (global.__cache) {
  cache = global.__cache;
} else {
  global.__cache =
    process.env.NODE_ENV === 'development'
      ? createLRUCacheProvider()
      : createRedisCacheProvider();
  cache = global.__cache;
}

export function createRedisCacheProvider(): CacheProvider {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not defined');
  }

  const redis = new Redis(process.env.REDIS_URL as string);

  return {
    async get(key: string) {
      const value = await redis.get(key);

      if (value) {
        return JSON.parse(value);
      }

      return null;
    },
    async set<Value>(key: string, value: Value, ttl?: number) {
      if (ttl) {
        await redis
          .multi()
          .set(key, JSON.stringify(value))
          .expire(key, ttl)
          .exec();
      }
    },
    async del(key: string) {
      await redis.del(key);
    },
    async has(key: string) {
      return (await redis.exists(key)) === 1;
    }
  };
}

export function createLRUCacheProvider(): CacheProvider {
  const lru = new LRU<string, any>({
    max: 1000,
    maxAge: 1000 * 60 * 60 * 24 * 3
  });

  return {
    async get<Value>(key: string) {
      return lru.get<Value>(key);
    },
    async set<Value>(key: string, value: Value, ttl?: number) {
      lru.set(key, value, {
        ttl
      });
    },
    async del(key: string) {
      lru.delete(key);
    },
    async has(key: string) {
      return lru.has(key);
    }
  };
}
