import { sql } from "drizzle-orm"
import { db } from "../../db"
import { logger } from "../../utils/log"

export const getAll = async () => {
  try {
    const stations = await db.execute(
      sql`SELECT * FROM station WHERE have_schedule = true ORDER BY id ASC, daop ASC, name ASC`
    )

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
