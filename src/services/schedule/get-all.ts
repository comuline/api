import { asc, eq, sql } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { dbSchema } from "../../db"
import { Schedule } from "../../db/schema"
import { getDB } from "../../types"

export const getAll = async (stationId: string) => {
  try {
    const db = getDB()
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
    const db = getDB()

    const now = new Date()

    const currentSecond = now.getSeconds()

    const minutes = now.getMinutes()

    const cache = new Cache<Schedule[]>(`schedule-${stationId}-${minutes}`, {
      ttl: 60 - currentSecond,
    })

    const cached = await cache.get()

    if (cached) return cached

    const schedules = await db.query.schedule.findMany({
      where: sql`station_id = ${stationId} AND time_estimated > (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta')::time`,
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.warn(
        `[QUERY][SCHEDULE][${stationId}] Schedule data from now is not found`,
      )
      return null
    }

    await cache.set(schedules)

    return schedules
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
