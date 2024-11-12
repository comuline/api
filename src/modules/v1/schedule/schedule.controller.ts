import { createRoute, z } from "@hono/zod-openapi"
import { asc, eq } from "drizzle-orm"
import { scheduleTable } from "../../../db/schema-new"
import { createAPI } from "../../api"
import { buildResponseSchemas } from "../../utils/response"
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
    const db = c.get("db")
    const data = await db
      .select()
      .from(scheduleTable)
      .where(eq(scheduleTable.station_id, param.station_id.toLocaleUpperCase()))
      .orderBy(asc(scheduleTable.time_departure))

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
