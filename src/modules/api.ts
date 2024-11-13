import { OpenAPIHono } from "@hono/zod-openapi"
import { Environments } from ".."

export const createAPI = <T extends Environments>() =>
  new OpenAPIHono<T>({ strict: true })
