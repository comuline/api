import { KVNamespace } from "@cloudflare/workers-types"
import { getKV } from "../../types"

class Cache<T> {
  protected ttl: number | null
  protected cache: KVNamespace
  public key: string
  public cached: T | null

  constructor(key: string, options?: { ttl?: number }) {
    this.ttl = options ? options.ttl ?? null : null
    this.key = key
    this.cached = null
    this.cache = getKV()
  }

  async set(value: T) {
    const self = this
    const val = typeof value === "string" ? value : JSON.stringify(value)
    return await self.cache.put(self.key, val, {
      expirationTtl: self.ttl ?? undefined,
    })
  }

  async get() {
    const self = this
    const data = await self.cache.get(self.key)
    if (data) {
      self.cached = JSON.parse(data) as T
    }
    return self.cached
  }
}

export default Cache
