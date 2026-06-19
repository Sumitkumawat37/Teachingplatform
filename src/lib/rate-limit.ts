// Rate Limiting Middleware for Production

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

export function clearExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clear expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(clearExpiredRateLimits, 60000);
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  forgotPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  payment: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 requests per hour
  contact: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  announcement: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 requests per hour
  doubt: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 requests per hour
  admin: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  general: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
};

export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  config: RateLimitConfig,
  getIdentifier: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const identifier = getIdentifier(...args);
    const result = checkRateLimit(identifier, config);
    
    if (!result.allowed) {
      const error = new Error('Rate limit exceeded. Please try again later.');
      (error as any).rateLimitInfo = {
        remaining: result.remaining,
        resetTime: result.resetTime,
      };
      throw error;
    }
    
    return fn(...args);
  }) as T;
}
