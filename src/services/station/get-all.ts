import { asc, eq } from "drizzle-orm"
import { InternalServerError } from "elysia"
import Cache from "../../commons/utils/cache"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { dbSchema } from "../../db"
import { Station } from "../../db/schema"
import { getDB } from "../../types"

export const getAll = async () => {
  try {
    const db = getDB()
    const cache = new Cache<Station[]>("station-all", {
      ttl:
        60 *
        new Date(Date.now()).getMinutes() *
        new Date(Date.now()).getHours(),
    })

    const cached = await cache.get()

    if (cached) return cached

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
        "No station data is existing. Please sync station data first.",
      )
    }

    await cache.set(stations)

    return stations
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
