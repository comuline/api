import { migrate } from "drizzle-orm/postgres-js/migrator"
import { logger } from "../utils/log"
import { db } from "./index"

// https://orm.drizzle.team/docs/migrations

try {
  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: "./src/db/migrations" })

  logger.info("Migration success")
  process.exit(0)
} catch (error) {
  logger.error(`Migration error: ${error}`)
  process.exit(0)
}
