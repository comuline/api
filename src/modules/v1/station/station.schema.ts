import { z } from "@hono/zod-openapi"
import { type StationMetadata, stationSchema } from "../../../db/schema"

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
        has_schedule: true,
        origin: {
          daop: 1,
          fg_enable: 1,
        },
      } satisfies StationMetadata,
    }),
    created_at: stationSchema.shape.created_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
    }),
    updated_at: stationSchema.shape.updated_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
    }),
  })
  .openapi("Station") satisfies typeof stationSchema
