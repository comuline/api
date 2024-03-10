import { sql } from "drizzle-orm"
import { db } from "../../db"
import { logger } from "../../utils/log"

export const getItemById = async (id: string) => {
  try {
    const stations = await db.execute(
      sql`SELECT * FROM station WHERE id = ${id}`
    )

    if (stations.length === 0) {
      logger.error(`[QUERY][STATION][${id}] Station data is not found`)
      return null
    }

    return stations[0]
  } catch (e) {
    throw e
  }
}
