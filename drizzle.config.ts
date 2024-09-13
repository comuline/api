import type { Config } from "drizzle-kit"

export default {
  out: "./drizzle/migrations",
  dialect: "postgresql",
  schema: "./src/db/schema-new",
} satisfies Config
