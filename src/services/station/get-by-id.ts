import { eq } from "drizzle-orm"
import { InternalServerError } from "elysia"
import { db, dbSchema } from "../../db"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { Station } from "../../db/schema"
import Cache from "../../commons/utils/cache"

export const getItemById = async (stationId: string) => {
  try {
    const cache = new Cache<Station>(`station-${stationId}`, {
      ttl:
        60 *
        new Date(Date.now()).getMinutes() *
        new Date(Date.now()).getHours(),
    })

    const cached = await cache.get()

    if (cached) return cached

    const station = await db.query.station.findFirst({
      where: eq(dbSchema.station.id, stationId),
    })

    if (!station) {
      logger.error(`[QUERY][STATION][${stationId}] Station data is not found`)
      return null
    }

    await cache.set(station)

    return station
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
