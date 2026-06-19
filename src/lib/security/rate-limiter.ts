import { supabase } from "@/integrations/supabase/client";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

const API_CONFIG: RateLimitConfig = {
  maxRequests: 50,
  windowMs: 60000,
};

const AUTH_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60000,
};

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);

    // Clean up old rate limit records
    await supabase
      .from("rate_limits")
      .delete()
      .lt("window_start", windowStart.toISOString());

    // Get current rate limit record
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart.toISOString())
      .single();

    if (!existing) {
      // Create new rate limit record
      await supabase.from("rate_limits").insert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: windowStart.toISOString(),
        updated_at: now.toISOString(),
      } as any);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: windowStart.getTime() + config.windowMs,
      };
    }

    // Check if limit exceeded
    if (existing.request_count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.window_start).getTime() + config.windowMs,
      };
    }

    // Increment request count
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({
        request_count: (existing as any).request_count + 1,
        updated_at: now.toISOString(),
      } as any)
      .eq("id", existing.id);

    if (updateError) {
      console.error("Error updating rate limit:", updateError);
    }

    return {
      allowed: true,
      remaining: config.maxRequests - (existing as any).request_count - 1,
      resetAt: new Date(existing.window_start).getTime() + config.windowMs,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowMs,
    };
  }
}

/**
 * Rate limit hook for API endpoints
 */
export function useRateLimit(endpoint: string, config: RateLimitConfig = API_CONFIG) {
  const getIdentifier = () => {
    // Use user ID if authenticated, otherwise use IP address
    const userId = localStorage.getItem("user_id");
    return userId || "anonymous";
  };

  const checkLimit = async () => {
    const identifier = getIdentifier();
    return await checkRateLimit(identifier, endpoint, config);
  };

  return { checkLimit };
}

/**
 * Rate limit for authentication endpoints
 */
export async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  const result = await checkRateLimit(identifier, "auth", AUTH_CONFIG);
  return result.allowed;
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | null,
  activity: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "suspicious_activity",
      entity_type: "security",
      entity_id: activity,
      metadata: { ...metadata, timestamp: new Date().toISOString() },
    } as any);

    if (error) {
      console.error("Error logging suspicious activity:", error);
    }
  } catch (error) {
    console.error("Error logging suspicious activity:", error);
  }
}

/**
 * Audit log helper
 */
export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata ? { ...metadata, timestamp: new Date().toISOString() } : null,
    } as any);

    if (error) {
      console.error("Error creating audit log:", error);
    }
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

/**
 * Get client IP address (for rate limiting)
 */
export function getClientIP(): string {
  // In a real implementation, this would come from the request headers
  // For client-side, we'll use a session ID
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}
