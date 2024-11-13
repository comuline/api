import { Database } from "./modules/v1/database"
import { constructResponse } from "./utils/response"

export type Bindings = {
  DATABASE_URL: string
  COMULINE_ENV: string
  UPSTASH_REDIS_REST_TOKEN: string
  UPSTASH_REDIS_REST_URL: string
}

export type Variables = {
  db: Database<Bindings>["db"]
  constructResponse: typeof constructResponse
}

export type Environments = {
  Bindings: Bindings
  Variables: Variables
}
