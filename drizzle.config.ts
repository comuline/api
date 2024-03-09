import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
