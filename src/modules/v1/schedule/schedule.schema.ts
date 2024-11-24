import { scheduleSchema, StationScheduleMetadata } from "@/db/schema"
import { z } from "@hono/zod-openapi"

export const scheduleResponseSchema = z
  .object({
    id: scheduleSchema.shape.id.openapi({
      example: "sc_krl_ac_2400",
      description: "Schedule unique ID",
    }),
    station_id: scheduleSchema.shape.station_id.openapi({
      example: "AC",
      description: "Station ID where the train stops",
    }),
    station_origin_id: scheduleSchema.shape.station_origin_id.openapi({
      example: "JAKK",
      description: "Station ID where the train originates",
    }),
    station_destination_id: scheduleSchema.shape.station_destination_id.openapi(
      {
        example: "TPK",
        description: "Station ID where the train terminates",
      },
    ),
    train_id: scheduleSchema.shape.train_id.openapi({
      example: "2400",
      description: "Train ID",
    }),
    line: scheduleSchema.shape.line.openapi({
      example: "COMMUTER LINE TANJUNGPRIUK",
      description: "Train line",
    }),
    route: scheduleSchema.shape.route.openapi({
      example: "JAKARTAKOTA-TANJUNGPRIUK",
      description: "Train route",
    }),
    departs_at: scheduleSchema.shape.departs_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
      description: "Train departure time",
    }),
    arrives_at: scheduleSchema.shape.arrives_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:09.213Z",
      description: "Train arrival time at destination",
    }),
    metadata: scheduleSchema.shape.metadata.openapi({
      type: "object",
      properties: {
        origin: {
          type: "object",
          properties: {
            color: {
              type: "string",
              nullable: true,
            },
          },
        },
      },
      example: {
        origin: {
          color: "#DD0067",
        },
      } satisfies StationScheduleMetadata,
    }),
    created_at: scheduleSchema.shape.created_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
    }),
    updated_at: scheduleSchema.shape.updated_at.openapi({
      format: "date-time",
      example: "2024-03-10T09:55:07.213Z",
    }),
  })
  .openapi("Schedule") satisfies typeof scheduleSchema
