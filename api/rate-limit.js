// ============================================
// RATE LIMITING MIDDLEWARE FOR 20K USERS
// ============================================
// Implements distributed rate limiting using Redis
// to prevent API abuse and ensure fair usage
// ============================================

import { Redis } from 'ioredis';

let redis = null;

// Initialize Redis connection
function getRedis() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (redisUrl) {
      redis = new Redis(redisUrl, {
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
    }
  }
  return redis;
}

// Rate limit configuration for different endpoints
const RATE_LIMITS = {
  // Auth endpoints - strict limits
  '/api/auth/login': { points: 5, duration: 60 }, // 5 requests per minute
  '/api/auth/signup': { points: 3, duration: 60 }, // 3 requests per minute
  '/api/auth/forgot-password': { points: 3, duration: 60 }, // 3 requests per minute
  
  // API endpoints - moderate limits
  '/api/email/send-verification': { points: 10, duration: 60 }, // 10 per minute
  '/api/email/send-password-reset': { points: 10, duration: 60 }, // 10 per minute
  
  // General API - higher limits
  default: { points: 100, duration: 60 }, // 100 requests per minute
};

// Rate limiting middleware
export async function rateLimit(req, res, next) {
  const client = getRedis();
  
  // If Redis is not available, skip rate limiting
  if (!client) {
    return next();
  }
  
  try {
    const identifier = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    const key = `rate_limit:${identifier}:${req.path}`;
    
    // Get rate limit config for this endpoint
    const config = RATE_LIMITS[req.path] || RATE_LIMITS.default;
    
    // Increment counter
    const current = await client.incr(key);
    
    // Set expiration on first request
    if (current === 1) {
      await client.expire(key, config.duration);
    }
    
    // Check if limit exceeded
    if (current > config.points) {
      const ttl = await client.ttl(key);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
        retryAfter: ttl,
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.points);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.points - current));
    res.setHeader('X-RateLimit-Reset', await client.ttl(key));
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow request to proceed
    next();
  }
}

// User-specific rate limiting
export async function userRateLimit(req, res, next) {
  const client = getRedis();
  
  if (!client || !req.user?.id) {
    return next();
  }
  
  try {
    const userId = req.user.id;
    const key = `rate_limit:user:${userId}:${req.path}`;
    
    const config = RATE_LIMITS[req.path] || RATE_LIMITS.default;
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, config.duration);
    }
    
    if (current > config.points) {
      const ttl = await client.ttl(key);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `User rate limit exceeded. Try again in ${ttl} seconds.`,
        retryAfter: ttl,
      });
    }
    
    res.setHeader('X-RateLimit-Limit', config.points);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.points - current));
    res.setHeader('X-RateLimit-Reset', await client.ttl(key));
    
    next();
  } catch (error) {
    console.error('User rate limiting error:', error);
    next();
  }
}

// IP-based rate limiting for sensitive operations
export async function strictRateLimit(req, res, next) {
  const client = getRedis();
  
  if (!client) {
    return next();
  }
  
  try {
    const identifier = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    const key = `rate_limit:strict:${identifier}:${req.path}`;
    
    // Very strict limits for sensitive operations
    const config = { points: 3, duration: 300 }; // 3 requests per 5 minutes
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, config.duration);
    }
    
    if (current > config.points) {
      const ttl = await client.ttl(key);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Strict rate limit exceeded. Try again in ${ttl} seconds.`,
        retryAfter: ttl,
      });
    }
    
    next();
  } catch (error) {
    console.error('Strict rate limiting error:', error);
    next();
  }
}

export default rateLimit;
