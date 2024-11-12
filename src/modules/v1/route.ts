import { createRoute, z } from "@hono/zod-openapi"
import { eq } from "drizzle-orm"
import { scheduleTable } from "../../db/schema-new"
import { createAPI } from "../api"
import { buildResponseSchemas } from "../utils/response"

const api = createAPI()

const routeController = api.openapi(
  createRoute({
    method: "get",
    path: "/{train_id}",
    request: {
      params: z.object({
        train_id: z
          .string()
          .min(2)
          .openapi({
            param: {
              name: "train_id",
              in: "path",
            },
            default: "2400",
            example: "2400",
          }),
      }),
    },
    responses: buildResponseSchemas([
      {
        status: 200,
        type: "data",
        schema: z.any(),
      },
      {
        status: 404,
        type: "metadata",
      },
    ]),
    tags: ["Route"],
  }),
  async (c) => {
    const param = c.req.valid("param")
    const { db } = c.var

    const data = await db.query.scheduleTable.findMany({
      with: {
        station: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (scheduleTable, { asc }) => [asc(scheduleTable.time_departure)],
      where: eq(scheduleTable.train_id, param.train_id),
    })

    const schedules = data.map(({ id, station_id, station, ...rest }) => ({
      id,
      station_id,
      station_name: station.name,
      ...rest,
    }))

    return c.json(
      {
        metadata: {
          success: true,
        },
        data: schedules,
      },
      200,
    )
  },
)

export default routeController
