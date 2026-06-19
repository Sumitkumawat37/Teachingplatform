// Redis client - only import on server side to prevent browser errors
let Redis: any = null;
let redis: any = null;

// Mock Redis class for browser environment
class MockRedis {
  private store = new Map<string, { value: string; expiry: number }>();
  
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
  
  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.store.set(key, { value, expiry: Date.now() + seconds * 1000 });
  }
  
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }
  
  on(event: string, handler: Function): void {
    // Mock event handlers
  }
}

// Dynamic import to prevent browser bundling issues
async function importRedis() {
  if (typeof window !== 'undefined') {
    return null; // Don't import in browser
  }
  if (!Redis) {
    try {
      const module = await import('ioredis');
      Redis = module.default;
    } catch (error) {
      console.error("Failed to import Redis:", error);
      return null;
    }
  }
  return Redis;
}

export async function getRedisClient(): Promise<any> {
  if (typeof window !== 'undefined') {
    return new MockRedis(); // Return mock in browser
  }
  
  if (!redis) {
    const RedisClass = await importRedis();
    if (!RedisClass) {
      console.warn("Redis not available - caching disabled");
      return new MockRedis();
    }
    
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (!redisUrl) {
      console.warn("Redis not configured - caching disabled");
      return new MockRedis();
    }
    
    redis = new RedisClass(redisUrl, {
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on("error", (err: any) => {
      console.error("Redis error:", err);
    });

    redis.on("connect", () => {
      console.log("Redis connected");
    });
  }
  
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

export default getRedisClient;
