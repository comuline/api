import { createRoute, z } from "@hono/zod-openapi"
import { asc, eq } from "drizzle-orm"
import { schedule } from "../../../db/schema-new"
import { createAPI } from "../../api"
import {
  buildDataResponseSchema,
  buildMetadataResponseSchema,
} from "../../utils/response"
import { scheduleResponseSchema } from "./schedule.schema"

const api = createAPI()

const scheduleController = api.openapi(
  createRoute({
    method: "get",
    path: "/{station_id}",
    request: {
      params: z.object({
        station_id: z
          .string()
          .min(2)
          .openapi({
            param: {
              name: "station_id",
              in: "path",
            },
            default: "AC",
            example: "AC",
          }),
      }),
    },
    responses: {
      ...buildDataResponseSchema(200, z.array(scheduleResponseSchema)),
      ...buildMetadataResponseSchema(404, "Not found"),
    },
    tags: ["Schedule"],
  }),
  async (c) => {
    const param = c.req.valid("param")
    const db = c.get("db")
    const data = await db
      .select()
      .from(schedule)
      .where(eq(schedule.station_id, param.station_id.toLocaleUpperCase()))
      .orderBy(asc(schedule.time_departure))

    return c.json(
      {
        metadata: {
          success: true,
        },
        data: c.var.constructResponse(z.array(scheduleResponseSchema), data),
      },
      200,
    )
  },
)

export default scheduleController
