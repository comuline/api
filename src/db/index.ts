import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { station, schedule } from "./schema"

if (!process.env.DATABASE_URL)
  throw new Error("Cannot migrate. DATABASE_URL is not set")

export const dbConnection = postgres(process.env.DATABASE_URL)

const dbSchema = {
  station,
  schedule,
}

const dbClient = drizzle(dbConnection, {
  schema: dbSchema,
})

export { dbSchema, dbClient }
