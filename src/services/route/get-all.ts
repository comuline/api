import { asc, eq } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { db, dbSchema } from "../../db"
import { Schedule } from "../../db/schema"

function popSchedules(schedules: Schedule[], fromStationId?: string): Schedule[] {
  if (fromStationId) {
    const index = schedules.findIndex(item => item.stationId === fromStationId);
    if (index >= 0) {
      return schedules.slice(index);
    } 
  }
  return schedules;
}

export const getAll = async (trainId: string, fromStationId?: string) => {
  try {
    const cache = new Cache<Schedule[]>(`route-${trainId}`, {
      ttl:
        60 *
        new Date(Date.now()).getMinutes() *
        new Date(Date.now()).getHours(),
    })

    const cached = await cache.get()

    if (cached) {
      return popSchedules(cached, fromStationId);
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

    return popSchedules(schedules, fromStationId);
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}

