import { asc, eq, sql } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { db, dbSchema } from "../../db"
import { Schedule } from "../../db/schema"

const CACHE_PREFIX = "route-"
const CACHE_TTL = 60 * 24

function createCacheKey(trainId: string): string {
  return `${CACHE_PREFIX}${trainId}`
}

function getCurrentTimeInMinutes(): number {
  const now = new Date()
  return now.getMinutes() * now.getHours()
}

async function getCachedSchedule(
  trainId: string,
  cache: Cache<Schedule[]>,
): Promise<Schedule[] | null> {
  const cached = await cache.get()
  if (cached) {
    return popSchedules(cached)
  }
  return null
}

function popSchedules(
  schedules: Schedule[],
  fromStationId?: string,
): Schedule[] {
  if (fromStationId) {
    const index = schedules.findIndex(
      (item) => item.stationId === fromStationId,
    )
    if (index >= 0) {
      return schedules.slice(index)
    }
  }
  return schedules
}

export const getAll = async (trainId: string, fromStationId?: string) => {
  try {
    const cacheKey = createCacheKey(trainId)
    const cache = new Cache<Schedule[]>(cacheKey, {
      ttl: CACHE_TTL * getCurrentTimeInMinutes(),
    })

    const cachedSchedules = await getCachedSchedule(trainId, cache)
    if (cachedSchedules) {
      return cachedSchedules
    }

    const schedules = await db.query.schedule.findMany({
      where: eq(dbSchema.schedule.trainId, trainId),
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][ROUTE][${trainId}] Route data is not found`)
      return null
    }

    await cache.set(schedules)

    return popSchedules(schedules, fromStationId)
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}

export const getAllFromNow = async (
  trainId: string,
  fromStationId?: string,
) => {
  try {
    const cacheKey = createCacheKey(trainId)
    const cache = new Cache<Schedule[]>(cacheKey, {
      ttl: CACHE_TTL * getCurrentTimeInMinutes(),
    })

    const cachedSchedules = await getCachedSchedule(trainId, cache)
    if (cachedSchedules) {
      return cachedSchedules
    }

    let rawQuery = sql` SELECT id, station_id, train_id, line, route, color, destination, time_estimated, destination_time, updated_at 
      FROM schedule 
      WHERE train_id = ${trainId}`

    if (fromStationId) {
      rawQuery = sql`${rawQuery} AND time_estimated >= (
          SELECT time_estimated FROM schedule 
          WHERE station_id = ${fromStationId} AND train_id = ${trainId}
        )`
    }

    rawQuery = sql`${rawQuery} ORDER BY time_estimated ASC`

    const result = await db.execute(sql`${rawQuery}`)

    const schedules: Schedule[] = result.map((row) => ({
      id: row.id as string,
      stationId: row.station_id as string,
      trainId: row.train_id as string,
      line: row.line as string,
      route: row.route as string,
      color: row.color as string,
      destination: row.destination as string,
      timeEstimated: row.time_estimated as string,
      destinationTime: row.destination_time as string,
      updatedAt: row.updated_at as string,
    }))

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
