import { InternalServerError } from "elysia"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { db, dbSchema } from "../../db"
import { asc, desc } from "drizzle-orm"

export const getAll = async () => {
  try {
    const items = await db.query.sync.findMany({
      limit: 20,
      orderBy: [desc(dbSchema.sync.n), asc(dbSchema.sync.createdAt)],
    })

    if (items.length === 0) {
      logger.error(`[QUERY][SYNC][ALL] Sync data is not found`)
      return []
    }

    return items
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
