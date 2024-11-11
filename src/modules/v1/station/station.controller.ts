import { createRoute, z } from "@hono/zod-openapi"
import { eq, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { NewStation, stationTable, StationType } from "../../../db/schema-new"
import { createAPI } from "../../api"
import {
  buildDataResponseSchema,
  buildMetadataResponseSchema,
} from "../../utils/response"
import { Sync } from "../sync"
import { stationResponseSchema } from "./station.schema"

const api = createAPI()

const createStationKey = (type: StationType, id: string) =>
  `st_${type}_${id}`.toLocaleLowerCase()

const stationController = api
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        ...buildDataResponseSchema(200, z.array(stationResponseSchema)),
      },
      tags: ["Station"],
      description: "Get all KRL station data",
    }),
    async (c) => {
      const { db } = c.var
      const stations = await db.select().from(stationTable)

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
      responses: {
        ...buildDataResponseSchema(200, stationResponseSchema),
        ...buildMetadataResponseSchema(404, "Not found"),
      },
      tags: ["Station"],
    }),
    async (c) => {
      const { id } = c.req.valid("param")
      const db = c.get("db")
      const data = await db
        .select()
        .from(stationTable)
        .where(eq(stationTable.id, id))

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
      responses: {
        ...buildMetadataResponseSchema(201, "Success", true),
      },
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

      const insertStations = filterdStation.map((s) => {
        return {
          uid: createStationKey("KRL", s.sta_id),
          id: s.sta_id,
          name: s.sta_name,
          type: "KRL",
          metadata: {
            has_schedule: true,
            original: {
              fg_enable: s.fg_enable,
              daop: s.group_wil === 0 ? 1 : s.group_wil,
            },
          },
        }
      }) satisfies NewStation[]

      await db
        .insert(stationTable)
        .values(insertStations)
        .onConflictDoUpdate({
          target: stationTable.uid,
          set: {
            updated_at: new Date(),
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
