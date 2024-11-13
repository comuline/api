import { sleep } from "bun"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"
import {
  NewSchedule,
  NewStation,
  scheduleTable,
  stationTable,
} from "../db/schema"
import { Database } from "../modules/v1/database"
import { parseTime } from "../utils/time"
import { KAI_HEADERS } from "./headers"

const sync = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL env is missing")
  if (!process.env.COMULINE_ENV) throw new Error("COMULINE_ENV env is missing")

  const { db } = new Database({
    COMULINE_ENV: process.env.COMULINE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  })

  const stations = await db
    .select({
      id: stationTable.id,
      metadata: stationTable.metadata,
      name: stationTable.name,
    })
    .from(stationTable)

  const batchSizes = 5
  const totalBatches = Math.ceil(stations.length / batchSizes)

  const schema = z.object({
    status: z.number(),
    data: z.array(
      z.object({
        train_id: z.string(),
        ka_name: z.string(),
        route_name: z.string(),
        dest: z.string(),
        time_est: z.string(),
        color: z.string(),
        dest_time: z.string(),
      }),
    ),
  })

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSizes
    const end = start + batchSizes
    const batch = stations.slice(start, end)

    await Promise.allSettled(
      batch.map(async ({ id, metadata }) => {
        await sleep(5000)

        const url = `https://api-partner.krl.co.id/krlweb/v1/schedule?stationid=${id}&timefrom=00:00&timeto=23:00`

        console.info(`[SYNC][SCHEDULE][${id}] Send preflight`)
        const optionsResponse = await fetch(url, {
          method: "OPTIONS",
          headers: {
            ...KAI_HEADERS,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
          },
          credentials: "include",
          mode: "cors",
        })

        if (!optionsResponse.ok) {
          throw new Error(
            `OPTIONS request failed with status: ${optionsResponse.status}`,
          )
        }
        const req = await fetch(url, {
          method: "GET",
          headers: KAI_HEADERS,
          credentials: "include",
          mode: "cors",
        })

        console.info(`[SYNC][SCHEDULE][${id}] Fetched data from API`)

        if (req.status === 200) {
          try {
            const data = await req.json()

            const parsed = schema.safeParse(data)

            if (!parsed.success) {
              console.error(`[SYNC][SCHEDULE][${id}] Error parse`)
            } else {
              const values = parsed.data.data.map((d) => {
                let [origin, destination] = d.route_name.split("-")

                const fixName = (name: string) => {
                  switch (name) {
                    case "TANJUNGPRIUK":
                      return "TANJUNG PRIOK"
                    case "JAKARTAKOTA":
                      return "JAKARTA KOTA"
                    case "KAMPUNGBANDAN":
                      return "KAMPUNG BANDAN"
                    case "TANAHABANG":
                      return "TANAH ABANG"
                    case "PARUNGPANJANG":
                      return "PARUNG PANJANG"
                    case "BANDARASOEKARNOHATTA":
                      return "BANDARA SOEKARNO HATTA"
                    default:
                      return name
                  }
                }

                origin = fixName(origin)
                destination = fixName(destination)

                return {
                  id: `sc_krl_${id}_${d.train_id}`.toLowerCase(),
                  station_id: id,
                  station_origin_id: stations.find(
                    ({ name }) => name === origin,
                  )?.id!,
                  station_destination_id: stations.find(
                    ({ name }) => name === destination,
                  )?.id!,
                  train_id: d.train_id,
                  line: d.ka_name,
                  route: d.route_name,
                  departs_at: parseTime(d.time_est).toISOString(),
                  arrives_at: parseTime(d.dest_time).toISOString(),
                  metadata: {
                    origin: {
                      color: d.color,
                    },
                  },
                } satisfies NewSchedule
              })

              const insert = await db
                .insert(scheduleTable)
                .values(values)
                .onConflictDoUpdate({
                  target: scheduleTable.id,
                  set: {
                    departs_at: sql`excluded.departs_at`,
                    arrives_at: sql`excluded.arrives_at`,
                    metadata: sql`excluded.metadata`,
                    updated_at: new Date().toLocaleString(),
                  },
                })
                .returning()

              console.info(
                `[SYNC][SCHEDULE][${id}] Inserted ${insert.length} rows`,
              )
            }
          } catch (err) {
            console.error(
              `[SYNC][SCHEDULE][${id}] Error inserting schedule data. Trace: ${JSON.stringify(
                err,
              )}. Status: ${req.status}.`,
            )
          }
        } else if (req.status === 404) {
          console.info(`[SYNC][SCHEDULE][${id}] No schedule data found`)
          const payload: Partial<NewStation> = {
            metadata: metadata
              ? {
                  ...metadata,
                  has_schedule: false,
                }
              : null,
            updated_at: new Date().toLocaleString(),
          }
          await db
            .update(stationTable)
            .set(payload)
            .where(eq(scheduleTable.id, id))
          console.info(
            `[SYNC][SCHEDULE][${id}] Updated station schedule availability status`,
          )
        } else {
          const err = await req.json()
          const txt = await req.text()
          console.error(
            `[SYNC][SCHEDULE][${id}] Error fetch schedule data. Trace: ${JSON.stringify(
              err,
            )}. Status: ${req.status}. Req: ${txt}`,
          )
          throw new Error(JSON.stringify(err))
        }
      }),
    )
  }
}

sync()
