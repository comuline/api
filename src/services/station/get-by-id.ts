import { eq } from "drizzle-orm"
import { InternalServerError } from "elysia"
import { db, dbSchema } from "../../db"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"

export const getItemById = async (stationId: string) => {
  try {
    const station = await db.query.station.findFirst({
      where: eq(dbSchema.station.id, stationId),
    })

    if (!station) {
      logger.error(`[QUERY][STATION][${stationId}] Station data is not found`)
      return null
    }

    return station
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
