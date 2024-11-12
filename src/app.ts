import { apiReference } from "@scalar/hono-api-reference"
import { createAPI } from "./modules/api"
import v1 from "./modules/v1"
import { Database } from "./modules/v1/database"
import { HTTPException } from "hono/http-exception"
import { constructResponse } from "./modules/utils/response"

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

const api = createAPI()

const app = api
  .doc("/openapi", (c) => ({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Comuline API",
    },
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: c.env.COMULINE_ENV,
      },
    ],
  }))
  .use(async (c, next) => {
    const { db } = new Database({
      COMULINE_ENV: c.env.COMULINE_ENV,
      DATABASE_URL: c.env.DATABASE_URL,
    })
    c.set("db", db)
    c.set("constructResponse", constructResponse)
    await next()
  })
  .route("/v1", v1)
  .use(
    "/docs",
    apiReference({
      cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference",
      spec: {
        url: "/openapi",
      },
    }),
  )
  .get("/status", (c) => c.json({ status: "ok" }))
  .notFound((c) => c.redirect("/docs"))
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json(
        {
          metadata: {
            success: false,
            message: err.message,
            cause: err.cause,
          },
        },
        err.status,
      )
    }
    return c.json(
      {
        metadata: {
          success: false,
          message: err.message,
          cause: err.cause,
        },
      },
      500,
    )
  })

export default app
