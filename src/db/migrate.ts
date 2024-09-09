import { config } from "dotenv"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import { drizzle } from "drizzle-orm/postgres-js"
import { logger } from "../commons/utils/log"

config({ path: ".env" })

const url = `${process.env.DATABASE_URL}`
const db = drizzle(postgres(url, { ssl: "require", max: 1 }))

const main = async () => {
  logger.info("Migrating database")
  await migrate(db, { migrationsFolder: "drizzle/migrations" })
  console.log("Migration complete")
  process.exit(0)
}

main()
