import { apiReference } from "@scalar/hono-api-reference"
import { createAPI } from "./modules/api"
import v1 from "./modules/v1"
import { Database } from "./modules/v1/database"
import { HTTPException } from "hono/http-exception"
import { constructResponse } from "./utils/response"
import { trimTrailingSlash } from "hono/trailing-slash"

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
  .use(trimTrailingSlash())
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
  .notFound(() => {
    throw new HTTPException(404, { message: "Not found" })
  })
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
