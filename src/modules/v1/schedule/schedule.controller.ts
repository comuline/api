import { createRoute, z } from "@hono/zod-openapi"
import { asc, eq, sql } from "drizzle-orm"
import { scheduleTable, Schedule } from "../../../db/schema"
import { createAPI } from "../../api"
import { buildResponseSchemas } from "../../../utils/response"
import { scheduleResponseSchema } from "./schedule.schema"
import { Cache } from "../cache"
import { getSecsToMidnight } from "../../../utils/time"

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
    responses: buildResponseSchemas([
      {
        status: 200,
        type: "data",
        schema: z.array(scheduleResponseSchema),
      },
    ]),
    tags: ["Schedule"],
    description: "Get all active schedule by station id",
  }),
  async (c) => {
    const param = c.req.valid("param")
    const { db } = c.var

    const cache = new Cache<Array<Schedule>>(
      c.env,
      `schedules:${param.station_id}`,
    )

    const cached = await cache.get()

    if (cached)
      return c.json(
        {
          metadata: {
            success: true,
          },
          data: c.var.constructResponse(
            z.array(scheduleResponseSchema),
            cached,
          ),
        },
        200,
      )

    const query = db
      .select()
      .from(scheduleTable)
      .where(eq(scheduleTable.station_id, sql.placeholder("station_id")))
      .orderBy(asc(scheduleTable.time_departure))
      .prepare("query_schedule_by_station_id")

    const data = await query.execute({
      station_id: param.station_id.toLocaleUpperCase(),
    })

    await cache.set(data, getSecsToMidnight())

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
