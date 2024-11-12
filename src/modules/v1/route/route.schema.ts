import { z } from "@hono/zod-openapi"
import { scheduleResponseSchema } from "../schedule/schedule.schema"
import { stationResponseSchema } from "../station/station.schema"

export const routeResponseSchema = z
  .object({
    routes: z.array(
      z.object({
        id: scheduleResponseSchema.shape.id,
        station_id: scheduleResponseSchema.shape.station_id,
        station_name: stationResponseSchema.shape.name.openapi({
          example: "ANCOL",
        }),
        time_departure: scheduleResponseSchema.shape.time_departure,
        created_at: scheduleResponseSchema.shape.created_at,
        updated_at: scheduleResponseSchema.shape.updated_at,
      }),
    ),
    details: z.object({
      train_id: scheduleResponseSchema.shape.train_id,
      line: scheduleResponseSchema.shape.line,
      route: scheduleResponseSchema.shape.route,
      station_origin_id: scheduleResponseSchema.shape.station_origin_id,
      station_origin_name: stationResponseSchema.shape.name.openapi({
        example: "JAKARTAKOTA",
      }),
      station_destination_id:
        scheduleResponseSchema.shape.station_destination_id,
      station_destination_name: z.string().optional().openapi({
        example: "TANJUNGPRIUK",
      }),
      time_at_destination: scheduleResponseSchema.shape.time_at_destination,
    }),
  })
  .openapi("Route")

export type RouteResponse = z.infer<typeof routeResponseSchema>
