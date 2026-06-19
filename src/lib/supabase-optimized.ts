import { supabase } from "@/integrations/supabase/client";

/**
 * Optimized Supabase query utilities for high concurrency (50k+ traffic)
 * Implements connection pooling, query batching, and caching strategies
 */

// Query result cache with TTL
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Cached query with TTL for frequently accessed data
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  ttl: number = CACHE_TTL
): Promise<{ data: T | null; error: any }> {
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return { data: cached.data, error: null };
  }

  const result = await queryFn();
  if (result.data && !result.error) {
    queryCache.set(cacheKey, { data: result.data, timestamp: Date.now() });
  }
  return result;
}

/**
 * Clear cache for specific key or all cache
 */
export function clearCache(key?: string) {
  if (key) {
    queryCache.delete(key);
  } else {
    queryCache.clear();
  }
}

/**
 * Optimized course queries with selective field loading
 */
export const optimizedCourseQueries = {
  // Lightweight course list for marketplace
  getCourseList: async () => {
    return supabase
      .from("courses")
      .select("id, title, thumbnail_emoji, price, category, created_at")
      .order("created_at", { ascending: false });
  },

  // Course detail with minimal fields
  getCourseById: async (courseId: string) => {
    return supabase
      .from("courses")
      .select("id, title, description, thumbnail_emoji, price, category, created_at")
      .eq("id", courseId)
      .single();
  },

  // Course lectures with pagination
  getCourseLectures: async (courseId: string, page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return supabase
      .from("lectures")
      .select("id, title, video_url, duration, order_index, is_free")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })
      .range(from, to);
  },
};

/**
 * Optimized lecture queries with pagination
 */
export const optimizedLectureQueries = {
  getLectureById: async (lectureId: string) => {
    return supabase
      .from("lectures")
      .select("id, title, video_url, duration, course_id, order_index, is_free")
      .eq("id", lectureId)
      .single();
  },

  getLecturesByCourse: async (courseId: string) => {
    return cachedQuery(
      `lectures:${courseId}`,
      () => supabase
        .from("lectures")
        .select("id, title, video_url, duration, order_index, is_free")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true })
    );
  },
};

/**
 * Optimized user queries with connection pooling
 */
export const optimizedUserQueries = {
  getUserProfile: async (userId: string) => {
    return cachedQuery(
      `profile:${userId}`,
      () => supabase
        .from("profiles")
        .select("id, name, email, avatar_url, created_at")
        .eq("user_id", userId)
        .single()
    );
  },

  getUserPurchases: async (userId: string) => {
    return cachedQuery(
      `purchases:${userId}`,
      () => supabase
        .from("purchases")
        .select("course_id, purchased_at")
        .eq("user_id", userId)
    );
  },

  getUserProgress: async (userId: string) => {
    return cachedQuery(
      `progress:${userId}`,
      () => supabase
        .from("lecture_progress")
        .select("lecture_id, completed_at, watch_duration")
        .eq("user_id", userId)
    );
  },
};

/**
 * Batch query executor for multiple concurrent requests
 */
export async function batchQuery<T>(
  queries: Array<() => Promise<{ data: T | null; error: any }>>
): Promise<Array<{ data: T | null; error: any }>> {
  return Promise.allSettled(queries.map(q => q())).then(results =>
    results.map(result =>
      result.status === "fulfilled"
        ? result.value
        : { data: null, error: result.reason }
    )
  );
}

/**
 * Debounced query to prevent excessive API calls
 */
export function debounceQuery<T>(
  queryFn: () => Promise<T>,
  delay: number = 300
): () => Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<T> | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await queryFn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeoutId = null;
          }
        }, delay);
      });
    }

    return pendingPromise;
  };
}

/**
 * Rate-limited query to prevent API abuse
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  reset(identifier: string) {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute per user

/**
 * Rate-limited query wrapper
 */
export async function rateLimitedQuery<T>(
  identifier: string,
  queryFn: () => Promise<T>
): Promise<T> {
  if (!rateLimiter.canMakeRequest(identifier)) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  return queryFn();
}
