import { z } from "@hono/zod-openapi"
import {
  scheduleSchema,
  StationScheduleMetadata,
  stationSchema,
} from "../../../db/schema"

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
    time_departure: scheduleSchema.shape.time_departure.openapi({
      example: "06:07:00",
      description: "Train departure time",
    }),
    time_at_destination: scheduleSchema.shape.time_at_destination.openapi({
      example: "06:16:00",
      description: "Train arrival time at destination",
    }),
    metadata: scheduleSchema.shape.metadata.openapi({
      type: "object",
      example: {
        origin: {
          color: "#DD0067",
        },
      } satisfies StationScheduleMetadata,
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
  .openapi("Schedule") satisfies typeof scheduleSchema
