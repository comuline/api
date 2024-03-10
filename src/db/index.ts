import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { station, schedule, sync } from "./schema"

if (!process.env.DATABASE_URL)
  throw new Error("Cannot migrate. DATABASE_URL is not set")

export const dbConnection = postgres(process.env.DATABASE_URL)

const dbSchema = {
  station,
  schedule,
  sync,
}

const db = drizzle(dbConnection, {
  schema: dbSchema,
})

export { dbSchema, db }
