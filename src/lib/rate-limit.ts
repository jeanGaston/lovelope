/**
 * Simple in-memory token-bucket rate limiter (MVP).
 * For production, replace the store with a Redis-backed implementation.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, Bucket>();

const CAPACITY = 5;          // max submissions per window
const REFILL_RATE = 1;       // tokens restored per second
const WINDOW_SECONDS = 60;   // refill window

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = store.get(key);

  if (!bucket) {
    bucket = { tokens: CAPACITY - 1, lastRefill: now };
    store.set(key, bucket);
    return { allowed: true, remaining: CAPACITY - 1 };
  }

  const elapsed = (now - bucket.lastRefill) / 1000;
  const refilled = Math.floor(elapsed * (CAPACITY / WINDOW_SECONDS) * REFILL_RATE);
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + refilled);
  if (refilled > 0) bucket.lastRefill = now;

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0 };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens };
}
