import { eq, sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { parseTime } from "../../commons/utils/date"
import { logger } from "../../commons/utils/log"
import { z } from "zod"
import { NewStation } from "../../db/schema"
import { sleep } from "bun"
import { InternalServerError } from "elysia"
import { handleError } from "../../commons/utils/error"

export const syncItem = async (id: string) => {
  try {
    const req = await fetch(
      `https://api-partner.krl.co.id/krlweb/v1/schedule?stationid=${id}&timefrom=00:00&timeto=24:00`
    ).then((res) => res.json())

    logger.info(`[SYNC][SCHEDULE][${id}] Fetched data from API`)

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
        })
      ),
    })

    if ((req as unknown as { status: number }).status === 404) {
      logger.warn(`[SYNC][SCHEDULE][${id}] No schedule data found`)

      const payload: Partial<NewStation> = {
        haveSchedule: false,
        updatedAt: new Date().toISOString(),
      }

      await db
        .update(dbSchema.station)
        .set(payload)
        .where(eq(dbSchema.station.id, id))

      logger.warn(
        `[SYNC][SCHEDULE][${id}] Updated station schedule availability status`
      )
    } else if ((req as unknown as { status: number }).status === 200) {
      const parsedData = schema.parse(req)

      const insert = await db
        .insert(dbSchema.schedule)
        .values(
          parsedData.data.map((d) => {
            return {
              id: `${id}-${d.train_id}`,
              stationId: id,
              trainId: d.train_id,
              line: d.ka_name,
              route: d.route_name,
              destination: d.dest,
              timeEstimated: parseTime(d.time_est).toLocaleTimeString(),
              destinationTime: parseTime(d.dest_time).toLocaleTimeString(),
              color: d.color,
            }
          })
        )
        .onConflictDoUpdate({
          target: dbSchema.schedule.id,
          set: {
            timeEstimated: sql`excluded.time_estimated`,
            destinationTime: sql`excluded.destination_time`,
            color: sql`excluded.color`,
            updatedAt: new Date().toISOString(),
          },
        })
        .returning()

      logger.info(`[SYNC][SCHEDULE][${id}] Inserted ${insert.length} rows`)
    } else {
      logger.error(
        `[SYNC][SCHEDULE][${id}] Error fetch schedule data. Trace: ${JSON.stringify(
          req
        )}`
      )
      throw new Error("Failed to fetch schedule data for: " + id)
    }
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}

export const sync = async () => {
  const stationsQuery = await db.query.station.findMany()

  const initialStations = await stationsQuery.map(({ id }) => id)

  if (initialStations.length === 0) {
    const err = "No station data is existing. Please sync station data first."
    logger.error("[SYNC][SCHEDULE] " + err)
    throw new Error(err)
  }

  const blacklistQuery = await db
    .select({
      id: dbSchema.station.id,
    })
    .from(dbSchema.station)
    .where(eq(dbSchema.station.haveSchedule, false))

  const blacklist = await blacklistQuery.map(({ id }) => id)

  const stations =
    blacklist.length > 0
      ? initialStations.filter((s) => !blacklist.includes(s))
      : initialStations

  try {
    logger.info("[SYNC][SCHEDULE] Syncing schedule data started")
    const batchSizes = 5
    const totalBatches = Math.ceil(stations.length / batchSizes)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSizes
      const end = start + batchSizes
      const batch = stations.slice(start, end)

      await Promise.allSettled(
        batch.map(async (id) => {
          await sleep(300)
          await syncItem(id)
        })
      )
    }
    logger.info("[SYNC][SCHEDULE] Syncing schedule data finished")
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
