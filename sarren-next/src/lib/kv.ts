/**
 * KV client wrapper.
 *
 * Priority:
 * 1. Vercel KV (Upstash REST) — when KV_REST_API_URL + KV_REST_API_TOKEN are set
 * 2. Standard Redis via ioredis — when REDIS_URL is set
 * 3. In-memory fallback — for local dev without any credentials
 */

// ── In-memory fallback ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, any>()

const memoryKv = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(key: string): Promise<T | null> {
    return store.has(key) ? (store.get(key) as T) : null
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any): Promise<void> {
    store.set(key, value)
  },
}

// ── Vercel KV (Upstash REST) ──────────────────────────────────────────────────

const hasVercelKv =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _vercelKv: typeof memoryKv | null = null

async function getVercelKv(): Promise<typeof memoryKv> {
  if (!_vercelKv) {
    const { kv } = await import('@vercel/kv')
    _vercelKv = kv as unknown as typeof memoryKv
  }
  return _vercelKv
}

// ── ioredis (standard REDIS_URL) ──────────────────────────────────────────────

const hasRedisUrl = Boolean(process.env.REDIS_URL)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _redis: any | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRedis(): Promise<any> {
  if (!_redis) {
    const { default: Redis } = await import('ioredis')
    _redis = new Redis(process.env.REDIS_URL!, { lazyConnect: false })
  }
  return _redis
}

const redisKv = {
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedis()
    const raw = await client.get(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any): Promise<void> {
    const client = await getRedis()
    await client.set(key, JSON.stringify(value))
  },
}

// ── Unified export ────────────────────────────────────────────────────────────

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    if (hasVercelKv) return (await getVercelKv()).get<T>(key)
    if (hasRedisUrl) return redisKv.get<T>(key)
    return memoryKv.get<T>(key)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any): Promise<void> {
    if (hasVercelKv) return (await getVercelKv()).set(key, value)
    if (hasRedisUrl) return redisKv.set(key, value)
    return memoryKv.set(key, value)
  },
}
