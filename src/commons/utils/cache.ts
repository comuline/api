import cache from "../libs/cache"

class Cache<T> {
  protected ttl: number | null
  public key: string
  public cached: T | null

  constructor(key: string, options?: { ttl?: number }) {
    this.ttl = options ? options.ttl ?? null : null
    this.key = key
    this.cached = null
  }

  async set(value: T) {
    const self = this
    await cache.set(
      self.key,
      typeof value === "string" ? value : JSON.stringify(value)
    )
    if (self.ttl) return await cache.expire(self.key, self.ttl)

    return
  }

  async get() {
    const self = this
    const data = await cache.get(self.key)
    if (data) {
      self.cached = JSON.parse(data) as T
    }
    return self.cached
  }
}

export default Cache
