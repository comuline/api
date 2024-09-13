import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

config({ path: ".dev.vars" })

const url = `${process.env.DATABASE_URL}`
const db = drizzle(postgres(url))

const main = async () => {
  console.info("Migrating database")
  await migrate(db, { migrationsFolder: "drizzle/migrations" })
  console.log("Migration complete")
  process.exit(0)
}

main()
