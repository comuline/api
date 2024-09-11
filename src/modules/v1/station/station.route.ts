import { createRoute, z } from "@hono/zod-openapi"
import { drizzle } from "drizzle-orm/d1"
import { createMiddleware } from "hono/factory"
import { Environments } from "../../../app"
import * as schema from "../../../db/schema-new"
import { getByIdRequestSchema, stationResponseSchema } from "./station.schema"

export const connectDB = (env: D1Database) => drizzle(env, { schema })

export const dbMiddleware = createMiddleware<Environments>(async (c, next) => {
  c.set("db", connectDB(c.env.DB))
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
