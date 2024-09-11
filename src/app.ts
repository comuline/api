import { D1Database, KVNamespace } from "@cloudflare/workers-types"
import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { NewStation, station } from "./db/schema-new"
import v1 from "./modules/v1"
import { dbMiddleware } from "./modules/v1/station/station.route"

export type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export type Variables = {
  db: DrizzleD1Database<typeof import("./db/schema-new")>
}

export type Environments = {
  Bindings: Bindings
  Variables: Variables
}

const app = new OpenAPIHono<Environments>()

app.use(dbMiddleware)

app.route("/v1", v1)

app.use(
  "/docs",
  apiReference({
    cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference",
    spec: {
      url: "/openapi",
    },
  }),
)

app.get("/", (c) => c.json({ status: "ok" }))

app.post("/echo", async (c) => {
  const db = c.get("db")

  const insert = {
    id: "AC",
    name: "ANCOL",
    type: "KRL",
    metadata: {
      fgEnable: 1,
      haveSchedule: true,
      daop: 1,
    },
  } satisfies NewStation

  const data = await db.insert(station).values(insert).returning()

  return c.json({
    status: 200,
    data,
  })
})

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
})

export default app
