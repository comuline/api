import postgres from "postgres"

if (!process.env.DATABASE_URL)
  throw new Error("Cannot migrate. DATABASE_URL is not set")

export const db = postgres(process.env.DATABASE_URL)

export default db
