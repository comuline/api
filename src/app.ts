import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import v1 from "./modules/v1"

const app = new OpenAPIHono()

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

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
})

export default app
