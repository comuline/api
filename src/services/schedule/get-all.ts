import { asc, eq, sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { logger } from "../../commons/utils/log"
import { InternalServerError } from "elysia"
import { handleError } from "../../commons/utils/error"
import { Schedule } from "../../db/schema"
import Cache from "../../commons/utils/cache"
import { parseTime } from "../../commons/utils/date"

export const getAll = async (stationId: string, fromNow: boolean) => {
  try {
    const cache = new Cache<Schedule[]>(`schedule-${stationId}`, {
      ttl:
        60 *
        new Date(Date.now()).getMinutes() *
        new Date(Date.now()).getHours(),
    })

    const cached = await cache.get()

    const now = new Date(Date.now())

    if (cached) {
      if (!fromNow) return cached
      const schedules = cached.filter(
        (s) =>
          s.timeEstimated &&
          new Date(parseTime(s.timeEstimated)).getTime() > now.getTime()
      )
      return schedules
    }

    const schedules = await db.query.schedule.findMany({
      where: eq(dbSchema.schedule.stationId, stationId),
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][SCHEDULE][${stationId}] Schedule data is not found`)
      return null
    }

    await cache.set(schedules)

    if (!fromNow) return schedules

    return schedules.filter(
      (s) =>
        s.timeEstimated &&
        new Date(parseTime(s.timeEstimated)).getTime() > now.getTime()
    )
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
