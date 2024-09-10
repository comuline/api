import { z } from "zod"
import { stationSchema } from "../../../db/schema"

export const stationResponseSchema = z
  .object({
    id: stationSchema.shape.id.openapi({
      example: "MRI",
    }),
    name: stationSchema.shape.name.openapi({
      example: "MANGGARAI",
    }),
    daop: stationSchema.shape.daop.openapi({
      example: 1,
    }),
    fgEnable: stationSchema.shape.fgEnable.openapi({
      example: 1,
    }),
    haveSchedule: stationSchema.shape.haveSchedule.openapi({
      example: true,
    }),
    updatedAt: stationSchema.shape.updatedAt.openapi({
      example: "2024-03-10T09:55:07.213Z",
    }),
  })
  .openapi("Station") satisfies typeof stationSchema

export const getByIdRequestSchema = z.object({
  id: z
    .string()
    .min(2)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "MRI",
    }),
})
