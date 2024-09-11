import type { Config } from "drizzle-kit"

/* export default {
  schema: "./src/db/schema",
  out: "./drizzle/migrations",
  dialect: "postgresql",
} satisfies Config */

export default {
  out: "./drizzle/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/db/schema-new",
} satisfies Config
