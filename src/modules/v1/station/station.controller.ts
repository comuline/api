import { createRoute, z } from "@hono/zod-openapi"
import { eq, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import {
  NewStation,
  Station,
  stationTable,
  StationType,
} from "../../../db/schema"
import { createAPI } from "../../api"
import { buildResponseSchemas } from "../../../utils/response"
import { Cache } from "../cache"
import { Sync } from "../sync"
import { getSecsToMidnight } from "../../../utils/time"
import { stationResponseSchema } from "./station.schema"

const api = createAPI()

const createStationKey = (type: StationType, id: string) =>
  `st_${type}_${id}`.toLocaleLowerCase()

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

      const stations = await db.select().from(stationTable)

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
            .min(2)
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
      description: "Get station by id",
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

      const data = await db
        .select()
        .from(stationTable)
        .where(eq(stationTable.id, param.id))

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
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      responses: buildResponseSchemas([
        {
          status: 201,
          type: "metadata",
          description: "Success",
        },
      ]),

      tags: ["Station"],
    }),
    async (c) => {
      const { db } = c.var

      // TODO: Refactor to CLI

      const schema = z.object({
        status: z.number(),
        message: z.string(),
        data: z.array(
          z.object({
            sta_id: z.string(),
            sta_name: z.string(),
            group_wil: z.number(),
            fg_enable: z.number(),
          }),
        ),
      })

      const sync = new Sync(
        "https://api-partner.krl.co.id/krlweb/v1/krl-station",
        {
          headers: {
            Authorization:
              "Bearer VXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc",
            Host: "api-partner.krl.co.id",
            Origin: "https://commuterline.id",
            Referer: "https://commuterline.id/",
          },
        },
      )

      const res = await sync.request(schema)

      if (res instanceof Response) {
        throw new HTTPException(417, {
          message: "Failed to sync",
        })
      }

      const filterdStation = res.data.filter((d) => !d.sta_id.includes("WIL"))

      const stations = filterdStation.map((s) => {
        return {
          uid: createStationKey("KRL", s.sta_id),
          id: s.sta_id,
          name: s.sta_name,
          type: "KRL",
          metadata: {
            has_schedule: true,
            origin: {
              fg_enable: s.fg_enable,
              daop: s.group_wil === 0 ? 1 : s.group_wil,
            },
          },
        }
      }) satisfies NewStation[]

      const newStations = [
        /** Bandara Soekarno Hatta */
        {
          uid: createStationKey("KRL", "BST"),
          id: "BST",
          name: "BANDARA SOEKARNO HATTA",
          type: "KRL",
          metadata: {
            has_schedule: true,
            origin: {
              fg_enable: 1,
              daop: 1,
            },
          },
        },
        /** Cikampek */
        {
          uid: createStationKey("KRL", "CKP"),
          id: "CKP",
          name: "CIKAMPEK",
          type: "LOCAL",
          metadata: {
            has_schedule: true,
            origin: {
              fg_enable: 1,
              daop: 1,
            },
          },
        },
        /** Purwakarta */
        {
          uid: createStationKey("KRL", "PWK"),
          id: "PWK",
          name: "PURWAKARTA",
          type: "LOCAL",
          metadata: {
            has_schedule: true,
            origin: {
              fg_enable: 1,
              daop: 2,
            },
          },
        },
      ] satisfies NewStation[]

      const insertStations = [...newStations, ...stations]

      await db
        .insert(stationTable)
        .values(insertStations)
        .onConflictDoUpdate({
          target: stationTable.uid,
          set: {
            updated_at: new Date().toLocaleString(),
            uid: sql`excluded.uid`,
            id: sql`excluded.id`,
            name: sql`excluded.name`,
          },
        })

      return c.json(
        {
          metadata: {
            success: true,
            message: "Success",
          },
        },
        200,
      )
    },
  )

export default stationController
