import { OpenAPIHono, z } from "@hono/zod-openapi"
import { eq, getTableColumns, SQL, sql } from "drizzle-orm"
import { SQLiteTable } from "drizzle-orm/sqlite-core"
import { Environments } from "../../../app"
import { NewStation, station } from "../../../db/schema-new"
import * as route from "./station.route"
import { stationResponseSchema } from "./station.schema"

const controller = new OpenAPIHono<Environments>()

controller.use(route.dbMiddleware)

controller.openapi(route.getAll, async (c) => {
  const db = c.get("db")
  const stations = await db.select().from(station)

  return c.json(
    {
      metadata: {
        status: 200,
        message: "Success",
      },
      data: stations,
    },
    200,
  )
})

controller.openapi(route.getById, async (c) => {
  const { id } = c.req.valid("param")
  const db = c.get("db")
  const data = await db.select().from(station).where(eq(station.id, id))

  if (data.length === 0) {
    return c.json(
      {
        metadata: {
          status: 404,
          message: "Station data is not found",
        },
      },
      404,
    )
  }

  return c.json(
    {
      metadata: {
        status: 200,
        message: "Success",
      },
      data: stationResponseSchema.parse(data[0]),
    },
    200,
  )
})

controller.openapi(route.sync, async (c) => {
  const db = c.get("db")

  const req = await fetch(
    "https://api-partner.krl.co.id/krlweb/v1/krl-station",
  ).then((res) => res.json())

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

  const parsed = schema.parse(req)

  const filterdStation = parsed.data.filter((d) => !d.sta_id.includes("WIL"))

  const insertStations = filterdStation.map((s) => {
    return {
      id: s.sta_id,
      name: s.sta_name,
      type: "KRL",
      metadata: {
        fgEnable: s.fg_enable,
        haveSchedule: true,
        daop: s.group_wil === 0 ? 1 : s.group_wil,
      },
    }
  }) satisfies NewStation[]

  let chunkSize = 32

  for (let i = 0; i < insertStations.length; i += chunkSize) {
    await db
      .insert(station)
      .values(insertStations.slice(i, i + chunkSize))
      .onConflictDoUpdate({
        target: station.id,
        set: conflictUpdateAllExcept(station, ["id", "name"]),
      })
      .returning()
  }

  return c.json(
    {
      metadata: {
        status: 200,
        message: "Success",
      },
    },
    200,
  )
})

export default controller

export function conflictUpdateAllExcept<
  T extends SQLiteTable,
  E extends (keyof T["$inferInsert"])[],
>(table: T, except: E) {
  const columns = getTableColumns(table)
  const updateColumns = Object.entries(columns).filter(
    ([col]) => !except.includes(col as keyof typeof table.$inferInsert),
  )

  return updateColumns.reduce(
    (acc, [colName, table]) => ({
      ...acc,
      [colName]: sql.raw(`excluded.${table.name}`),
    }),
    {},
  ) as Omit<Record<keyof typeof table.$inferInsert, SQL>, E[number]>
}
