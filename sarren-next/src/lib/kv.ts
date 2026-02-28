/**
 * KV client wrapper.
 *
 * Uses the real @vercel/kv when credentials are configured (production / Vercel dev).
 * Falls back to a simple in-memory store for local development without KV provisioned.
 */

const hasKv =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN)

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

// Lazy-load the real client only when credentials exist to avoid the
// "Missing required environment variables" error thrown at import time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _realKv: typeof memoryKv | null = null

async function getRealKv(): Promise<typeof memoryKv> {
  if (!_realKv) {
    const { kv } = await import('@vercel/kv')
    _realKv = kv as unknown as typeof memoryKv
  }
  return _realKv
}

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    if (!hasKv) return memoryKv.get<T>(key)
    return (await getRealKv()).get<T>(key)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any): Promise<void> {
    if (!hasKv) return memoryKv.set(key, value)
    return (await getRealKv()).set(key, value)
  },
}
