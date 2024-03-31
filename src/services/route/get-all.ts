import { and, asc, eq, gte, sql } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { db, dbSchema } from "../../db"
import { Schedule, Station } from "../../db/schema"
import { getSecondsRemainingFromNow } from "../../commons/utils/date"

export const getAll = async (trainId: string) => {
  try {
    const cache = new Cache<(Schedule & { stationName: Station["name"] })[]>(
      `route-${trainId}`,
      {
        ttl: getSecondsRemainingFromNow(),
      },
    )

    const cached = await cache.get()

    if (cached) return cached

    const result = await db
      .select()
      .from(dbSchema.schedule)
      .leftJoin(
        dbSchema.station,
        eq(dbSchema.schedule.stationId, dbSchema.station.id),
      )
      .where(eq(dbSchema.schedule.trainId, trainId))
      .orderBy(asc(dbSchema.schedule.timeEstimated))

    const schedules = result.map((res) => ({
      ...res.schedule,
      stationName: res.station?.name || null,
    }))
    // Add the last station schedule
    schedules.push({
      ...schedules[0],
      stationName: schedules[0].destination,
      timeEstimated: schedules[0].destinationTime,
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][ROUTE][${trainId}] Route data is not found`)
      return null
    }

    await cache.set(schedules)

    return schedules
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}

export const getAllFrom = async (trainId: string, fromStationId?: string) => {
  try {
    const cache = new Cache<(Schedule & { stationName: Station["name"] })[]>(
      `route-${trainId}-${fromStationId}`,
      {
        ttl: getSecondsRemainingFromNow(),
      },
    )

    const cached = await cache.get()

    if (cached) return cached

    const result = await db
      .select()
      .from(dbSchema.schedule)
      .leftJoin(
        dbSchema.station,
        eq(dbSchema.schedule.stationId, dbSchema.station.id),
      )
      .where(
        and(
          eq(dbSchema.schedule.trainId, trainId),
          gte(
            dbSchema.schedule.timeEstimated,
            sql`(
          SELECT time_estimated FROM schedule 
          WHERE station_id = ${fromStationId} AND train_id = ${trainId}
          )`,
          ),
        ),
      )
      .orderBy(asc(dbSchema.schedule.timeEstimated))

    const schedules = result.map((res) => ({
      ...res.schedule,
      stationName: res.station?.name || null,
    }))
    // Add the last station schedule
    schedules.push({
      ...schedules[0],
      stationName: schedules[0].destination,
      timeEstimated: schedules[0].destinationTime,
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][ROUTE][${trainId}] Route data is not found`)
      return null
    }

    await cache.set(schedules)

    return schedules
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
