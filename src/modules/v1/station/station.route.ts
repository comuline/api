import { createRoute, z } from "@hono/zod-openapi"
import { neonConfig, Pool } from "@neondatabase/serverless"

import { drizzle } from "drizzle-orm/neon-serverless"
import { createMiddleware } from "hono/factory"
import { Environments } from "../../../app"
import * as schema from "../../../db/schema-new"
import { getByIdRequestSchema, stationResponseSchema } from "./station.schema"

export const connectDB = (url: string, env: string) => {
  if (env === "development") {
    // Set the WebSocket proxy to work with the local instance
    neonConfig.wsProxy = (host) => `${host}:5433/v1`
    // Disable all authentication and encryption
    neonConfig.useSecureWebSocket = false
    neonConfig.pipelineTLS = false
    neonConfig.pipelineConnect = false
  }

  const pool = new Pool({ connectionString: url, ssl: true })
  return drizzle(pool, { schema })
}

export const dbMiddleware = createMiddleware<Environments>(async (c, next) => {
  c.set("db", connectDB(c.env.DATABASE_URL, c.env.COMULINE_ENV))
  await next()
})

export const getAll = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            metadata: z.object({
              status: z.number().openapi({
                example: 200,
              }),
              message: z.string().openapi({
                example: "Success",
              }),
            }),
            data: z.array(stationResponseSchema),
          }),
        },
      },
      description: "Retrieve all the station",
    },
  },
  tags: ["Station"],
})

export const getById = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: getByIdRequestSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            metadata: z.object({
              status: z.number().openapi({
                example: 200,
              }),
              message: z.string().openapi({
                example: "Success",
              }),
            }),
            data: stationResponseSchema,
          }),
        },
      },
      description: "Retrieve one of the station",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            metadata: z.object({
              status: z.number().openapi({
                example: 404,
              }),
              message: z.string().openapi({
                example: "Station data is not found",
              }),
            }),
          }),
        },
      },
      description: "Station data is not found",
    },
  },
  tags: ["Station"],
})

export const sync = createRoute({
  method: "post",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            metadata: z.object({
              status: z.number().openapi({
                example: 200,
              }),
              message: z.string().openapi({
                example: "Success",
              }),
            }),
          }),
        },
      },
      description: "Sync station data",
    },
  },
  tags: ["Station"],
})
