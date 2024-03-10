import { sql } from "drizzle-orm"
import { db } from "../../db"
import { logger } from "../../utils/log"

export const getAll = async (stationId: string) => {
  try {
    const schedules = await db.execute(
      sql`SELECT * FROM schedule WHERE station_id = ${stationId} ORDER BY time_estimated ASC`
    )

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
    const schedules = await db.execute(
      sql`SELECT * FROM schedule WHERE station_id = ${stationId} AND time_estimated > (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta')::time ORDER BY time_estimated ASC`
    )

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
