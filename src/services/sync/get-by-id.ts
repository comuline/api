import { eq } from "drizzle-orm"
import { InternalServerError } from "elysia"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { dbSchema } from "../../db"
import { getDB } from "../../types"

export const getItemById = async (syncId: string) => {
  try {
    const db = getDB()
    const item = await db.query.sync.findFirst({
      where: eq(dbSchema.sync.id, syncId),
    })

    if (!item) {
      logger.error(`[QUERY][SYNC][${syncId}] Sync data is not found`)
      return null
    }

    return item
  } catch (e) {
    throw new InternalServerError(handleError(e))
  }
}
