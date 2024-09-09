import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
export * as dbSchema from "./schema"

export const createDB = (url: string) => {
  const sql = neon(url)
  return drizzle(sql)
}
