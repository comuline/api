import { migrate } from "drizzle-orm/postgres-js/migrator"
import { dbClient } from "./index"

// https://orm.drizzle.team/docs/migrations

try {
  // This will run migrations on the database, skipping the ones already applied
  await migrate(dbClient, { migrationsFolder: "./src/db/migrations" })

  console.info("Migration success")
  process.exit(0)
} catch (error) {
  console.error(`Migration error: ${error}`)
}
