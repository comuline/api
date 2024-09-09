import Container from "typedi"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"

export interface Env {
  DB: NeonHttpDatabase
  DATABASE_URL: string
  REDIS_URL: string
  SYNC_TOKEN: string
}
export const getEnv = () => Container.get<Env>("env")
export const getDB = () =>
  Container.get<NeonHttpDatabase<typeof import("../src/db/schema")>>(
    "DrizzleDatabase",
  )
