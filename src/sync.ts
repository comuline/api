import { sleep } from "bun"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"
import {
  NewSchedule,
  NewStation,
  scheduleTable,
  stationTable,
} from "./db/schema-new"
import { Database } from "./modules/v1/database"

export function parseTime(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours ?? date.getHours())
  date.setMinutes(minutes ?? date.getMinutes())
  date.setSeconds(seconds ?? date.getSeconds())

  return date
}

const sync = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL env is missing")

  const { db } = new Database({
    COMULINE_ENV: "development",
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

        const headers = {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.5",
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc",
          Priority: "u=0",
        }

        console.info(`[SYNC][SCHEDULE][${id}] Send preflight`)
        const optionsResponse = await fetch(url, {
          method: "OPTIONS",
          headers: {
            ...headers,
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
          headers,
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
                  time_departure: parseTime(d.time_est).toLocaleTimeString(),
                  time_at_destination: parseTime(
                    d.dest_time,
                  ).toLocaleTimeString(),
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
                    time_departure: sql`excluded.time_departure`,
                    time_at_destination: sql`excluded.time_at_destination`,
                    metadata: sql`excluded.metadata`,
                    updated_at: new Date(),
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
            updated_at: new Date(),
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
