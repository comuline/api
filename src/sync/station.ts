import { sql } from "drizzle-orm"
import { z } from "zod"
import { NewStation, stationTable, StationType } from "../db/schema"
import { Database } from "../modules/v1/database"
import { KAI_HEADERS } from "./headers"

const createStationKey = (type: StationType, id: string) =>
  `st_${type}_${id}`.toLocaleLowerCase()

const sync = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL env is missing")
  if (!process.env.COMULINE_ENV) throw new Error("COMULINE_ENV env is missing")

  const { db } = new Database({
    COMULINE_ENV: process.env.COMULINE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  })

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

  const url = "https://api-partner.krl.co.id/krlweb/v1/krl-station"

  const req = await fetch(url, {
    method: "GET",
    headers: KAI_HEADERS,
  })

  if (!req.ok)
    throw new Error(
      `[SYNC][STATION] Request failed with status: ${req.status}`,
      {
        cause: await req.text(),
      },
    )

  const data = await req.json()

  const parsedData = schema.safeParse(data)

  if (!parsedData.success) {
    throw new Error(parsedData.error.message, {
      cause: parsedData.error.cause,
    })
  }

  const filteredStation = parsedData.data.data.filter(
    (d) => !d.sta_id.includes("WIL"),
  )

  const stations = filteredStation.map((s) => {
    return {
      uid: createStationKey("KRL", s.sta_id),
      id: s.sta_id,
      name: s.sta_name,
      type: "KRL",
      metadata: {
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
    .returning()

  console.info(`[SYNC][STATION] Inserted ${insertStations.length} rows`)

  process.exit(0)
}

sync()
