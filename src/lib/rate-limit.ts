const hits = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window rate limiter, keyed by caller-provided id
 * (e.g. `${route}:${ip}`). Good enough for a single-instance dev/demo
 * deployment — swap for a shared store (Redis, etc.) behind multiple
 * instances.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
