import { z } from "zod"
import { StationMetadata, stationSchema } from "../../../db/schema-new"

export const stationResponseSchema = z
  .object({
    uid: stationSchema.shape.uid.openapi({
      example: "st_krl_mri",
    }),
    id: stationSchema.shape.id.openapi({
      example: "MRI",
    }),
    name: stationSchema.shape.name.openapi({
      example: "MANGGARAI",
    }),
    type: stationSchema.shape.type.openapi({
      type: "string",
      example: "KRL",
    }),
    metadata: stationSchema.shape.metadata.openapi({
      type: "object",
      example: {
        fgEnable: 1,
        haveSchedule: true,
        daop: 1,
      } satisfies StationMetadata,
    }),
    createdAt: stationSchema.shape.createdAt.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
    }),
    updatedAt: stationSchema.shape.updatedAt.openapi({
      format: "date-time",
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
