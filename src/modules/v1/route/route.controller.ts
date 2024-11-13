import { createRoute, z } from "@hono/zod-openapi"
import { eq, sql } from "drizzle-orm"
import { scheduleTable } from "@/db/schema"
import { buildResponseSchemas } from "@/utils/response"
import { getSecsToMidnight } from "@/utils/time"
import { createAPI } from "@/modules/api"
import { Cache } from "../cache"
import { Route, routeResponseSchema } from "./route.schema"

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
        schema: routeResponseSchema,
      },
    ]),
    tags: ["Route"],
    description: "Get sequence of station stop by train ID",
  }),
  async (c) => {
    const param = c.req.valid("param")
    const { db } = c.var

    const cache = new Cache<Route>(c.env, `route:${param.train_id}`)

    const cached = await cache.get()

    if (cached)
      return c.json(
        {
          metadata: {
            success: true,
          },
          data: c.var.constructResponse(routeResponseSchema, cached),
        },
        200,
      )

    const query = db.query.scheduleTable
      .findMany({
        with: {
          station: {
            columns: {
              name: true,
            },
          },
          station_destination: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: (scheduleTable, { asc }) => [
          asc(scheduleTable.time_departure),
        ],
        where: eq(scheduleTable.train_id, sql.placeholder("train_id")),
      })
      .prepare("query_route_by_train_id")

    const data = await query.execute({
      train_id: param.train_id,
    })

    if (data.length === 0)
      return c.json(
        {
          metadata: {
            success: true,
          },
          data: [],
        },
        200,
      )

    const response = {
      routes: data.map(
        ({
          id,
          station_id,
          station,
          time_departure,
          created_at,
          updated_at,
        }) => ({
          id,
          station_id,
          station_name: station.name,
          time_departure,
          created_at,
          updated_at,
        }),
      ),
      details: {
        train_id: param.train_id,
        line: data[0].line,
        route: data[0].route,
        station_origin_id: data[0].station_origin_id,
        station_origin_name: data[0].station.name,
        station_destination_id: data[0].station_destination_id,
        station_destination_name: data[0].station_destination?.name ?? "",
        time_at_destination: data[0].time_at_destination,
      },
    } satisfies Route

    await cache.set(response, getSecsToMidnight())

    return c.json(
      {
        metadata: {
          success: true,
        },
        data: c.var.constructResponse(routeResponseSchema, response),
      },
      200,
    )
  },
)

export default routeController
