import { neonConfig, Pool } from "@neondatabase/serverless"
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless"
import * as schema from "../../db/schema-new"

export class Database<
  T extends {
    DATABASE_URL: string
    COMULINE_ENV: string
  },
> {
  db: NeonDatabase<typeof schema>

  constructor(protected env: T) {
    this.db = connectDB(env.DATABASE_URL, env.COMULINE_ENV)
  }
}

export const connectDB = (url: string, env: string) => {
  if (env === "development") {
    neonConfig.wsProxy = (host) => `${host}:5433/v1`
    neonConfig.useSecureWebSocket = false
    neonConfig.pipelineTLS = false
    neonConfig.pipelineConnect = false
  }

  const pool = new Pool({ connectionString: url, ssl: true })
  return drizzle(pool, { schema })
}
