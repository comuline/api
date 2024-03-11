import { asc, eq, sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { logger } from "../../commons/utils/log"
import { InternalServerError } from "elysia"
import { handleError } from "../../commons/utils/error"
import { Schedule } from "../../db/schema"
import Cache from "../../commons/utils/cache"

export const getAll = async (stationId: string) => {
  try {
    const cache = new Cache<Schedule[]>(`schedule-${stationId}`, {
      ttl:
        60 *
        new Date(Date.now()).getMinutes() *
        new Date(Date.now()).getHours(),
    })

    const cached = await cache.get()

    if (cached) return cached

    const schedules = await db.query.schedule.findMany({
      where: eq(dbSchema.schedule.stationId, stationId),
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][SCHEDULE][${stationId}] Schedule data is not found`)
      return null
    }

    await cache.set(schedules)

    return schedules
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}

export const getAllFromNow = async (stationId: string) => {
  try {
    const cache = new Cache<Schedule[]>(`schedule-${stationId}-from-now`, {
      ttl: 60,
    })

    const cached = await cache.get()

    if (cached) return cached

    const schedules = await db.query.schedule.findMany({
      where: sql`station_id = ${stationId} AND time_estimated > (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta')::time`,
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.error(
        `[QUERY][SCHEDULE][${stationId}] Schedule data from now is not found`
      )
      return null
    }

    await cache.set(schedules)

    return schedules
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
