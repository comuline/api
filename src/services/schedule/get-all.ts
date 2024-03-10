import { asc, eq, sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { logger } from "../../utils/log"

export const getAll = async (stationId: string) => {
  try {
    const schedules = await db.query.schedule.findMany({
      where: eq(dbSchema.schedule.stationId, stationId),
      orderBy: [asc(dbSchema.schedule.timeEstimated)],
    })

    if (schedules.length === 0) {
      logger.error(`[QUERY][SCHEDULE][${stationId}] Schedule data is not found`)
      return null
    }

    return schedules
  } catch (e) {
    throw e
  }
}

export const getAllFromNow = async (stationId: string) => {
  try {
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

    return schedules
  } catch (e) {
    throw e
  }
}
