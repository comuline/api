import { asc, eq, sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { logger } from "../../utils/log"

export const getAll = async () => {
  try {
    const stations = await db.query.station.findMany({
      orderBy: [
        asc(dbSchema.station.id),
        asc(dbSchema.station.daop),
        asc(dbSchema.station.name),
      ],
      where: eq(dbSchema.station.haveSchedule, true),
    })

    if (stations.length === 0) {
      logger.error(`[QUERY][STATION][ALL] Stations data is not found`)
      throw new Error(
        "No station data is existing. Please sync station data first."
      )
    }

    return stations
  } catch (e) {
    throw e
  }
}
