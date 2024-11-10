import { OpenAPIHono } from "@hono/zod-openapi"
import { Environments } from "../app"

export const createAPI = <T extends Environments>() => new OpenAPIHono<T>()
