import { createRoute, z } from "@hono/zod-openapi"
import { eq, sql } from "drizzle-orm"
import { Station, stationTable } from "../../../db/schema"
import { buildResponseSchemas } from "../../../utils/response"
import { getSecsToMidnight } from "../../../utils/time"
import { createAPI } from "../../api"
import { Cache } from "../cache"
import { stationResponseSchema } from "./station.schema"

const api = createAPI()

const stationController = api
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: buildResponseSchemas([
        {
          status: 200,
          type: "data",
          schema: z.array(stationResponseSchema),
        },
      ]),
      tags: ["Station"],
      description: "Get all station data",
    }),
    async (c) => {
      const { db } = c.var

      const cache = new Cache<Array<Station>>(c.env, "stations")

      const cached = await cache.get()

      if (cached)
        return c.json(
          {
            metadata: {
              success: true,
            },
            data: c.var.constructResponse(
              z.array(stationResponseSchema),
              cached,
            ),
          },
          200,
        )

      const query = db.select().from(stationTable).prepare("query_all_stations")

      const stations = await query.execute()

      await cache.set(stations, getSecsToMidnight())

      return c.json(
        {
          metadata: {
            success: true,
          },
          data: c.var.constructResponse(
            z.array(stationResponseSchema),
            stations,
          ),
        },
        200,
      )
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/{id}",
      request: {
        params: z.object({
          id: z
            .string()
            .min(1)
            .openapi({
              param: {
                name: "id",
                in: "path",
              },
              default: "MRI",
              example: "MRI",
            }),
        }),
      },
      responses: buildResponseSchemas([
        {
          status: 200,
          type: "data",
          schema: stationResponseSchema,
        },
        {
          status: 404,
          type: "metadata",
        },
      ]),
      tags: ["Station"],
      description: "Get station by ID",
    }),
    async (c) => {
      const param = c.req.valid("param")

      const { db } = c.var

      const cache = new Cache<Station>(c.env, `station:${param.id}`)

      const cached = await cache.get()

      if (cached)
        return c.json(
          {
            metadata: {
              success: true,
            },
            data: c.var.constructResponse(stationResponseSchema, cached),
          },
          200,
        )

      const query = db
        .select()
        .from(stationTable)
        .where(eq(stationTable.id, sql.placeholder("id")))
        .prepare("query_station_by_id")

      const data = await query.execute({ id: param.id.toLocaleUpperCase() })

      if (data.length === 0)
        return c.json(
          {
            metadata: {
              success: false,
              message: "Station not found",
            },
          },
          404,
        )

      await cache.set(data[0], getSecsToMidnight())

      return c.json(
        {
          metadata: {
            success: true,
          },
          data: c.var.constructResponse(stationResponseSchema, data[0]),
        },
        200,
      )
    },
  )

export default stationController
