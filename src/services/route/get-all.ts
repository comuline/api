import { asc, eq, sql } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { db, dbSchema } from "../../db"
import { Schedule } from "../../db/schema"

const CACHE_TTL = 60 * 24

function getCurrentTimeInMinutes(): number {
  const now = new Date()
  return now.getMinutes() * now.getHours()
}

export const getAll = async (trainId: string) => {
  try {
    const cache = new Cache<Schedule[]>(`route-${trainId}`, {
      ttl: CACHE_TTL * getCurrentTimeInMinutes(),
    })

    const cached = await cache.get()

    if (cached) return cached

    const schedules = await db.query.schedule.findMany({
      where: eq(dbSchema.schedule.trainId, trainId),
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
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
    const cache = new Cache<Schedule[]>(`route-${trainId}-${fromStationId}`, {
      ttl: CACHE_TTL * getCurrentTimeInMinutes(),
    })

    const cached = await cache.get()

    if (cached) return cached

    const schedules = await db.query.schedule.findMany({
      where: sql`train_id = ${trainId} AND time_estimated >= (
        SELECT time_estimated FROM schedule 
        WHERE station_id = ${fromStationId} AND train_id = ${trainId}
      )`,
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
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
