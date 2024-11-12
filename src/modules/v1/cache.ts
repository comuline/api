import { Redis } from "@upstash/redis/cloudflare"

export class Cache<T> {
  protected kv: Redis
  public key: string

  constructor(
    protected env: {
      UPSTASH_REDIS_REST_TOKEN: string
      UPSTASH_REDIS_REST_URL: string
    },
    key: string,
  ) {
    this.key = key
    this.kv = Redis.fromEnv(env)
  }

  async get(): Promise<T | null> {
    const data = await this.kv.get<T>(this.key)
    return data ?? null
  }

  async set(value: T, ttl?: number): Promise<void> {
    await this.kv.set(
      this.key,
      JSON.stringify(value),
      ttl
        ? {
            ex: ttl,
          }
        : undefined,
    )
  }
}
