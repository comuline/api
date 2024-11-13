import { OpenAPIHono } from "@hono/zod-openapi"
import { type Environments } from "@/type"

export const createAPI = <T extends Environments>() =>
  new OpenAPIHono<T>({ strict: true })
