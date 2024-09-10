import { createRoute, z } from "@hono/zod-openapi"
import { getByIdRequestSchema, stationResponseSchema } from "./station.schema"

export const getAll = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.number().openapi({
              example: 200,
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
            status: z.number().openapi({
              example: 200,
            }),
            data: stationResponseSchema,
          }),
        },
      },
      description: "Retrieve one of the station",
    },
  },
  tags: ["Station"],
})
