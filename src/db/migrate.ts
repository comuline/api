import { migrate } from "drizzle-orm/postgres-js/migrator"
import { dbClient } from "./index"
import { logger } from "../utils/log"

// https://orm.drizzle.team/docs/migrations

try {
  // This will run migrations on the database, skipping the ones already applied
  await migrate(dbClient, { migrationsFolder: "./src/db/migrations" })

  logger.info("Migration success")
  process.exit(0)
} catch (error) {
  logger.error(`Migration error: ${error}`)
}
