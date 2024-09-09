import { sql } from "drizzle-orm"
import { InternalServerError } from "elysia"
import { z } from "zod"
import { handleError } from "../../commons/utils/error"
import { logger } from "../../commons/utils/log"
import { dbSchema } from "../../db"
import { getDB } from "../../types"

export const sync = async () => {
  try {
    const db = getDB()
    logger.info("[SYNC][STATION] Syncing station data started")

    const req = await fetch(
      "https://api-partner.krl.co.id/krlweb/v1/krl-station",
    ).then((res) => res.json())

    logger.info("[SYNC][STATION] Fetched data from API")

    const schema = z.object({
      status: z.number(),
      message: z.string(),
      data: z.array(
        z.object({
          sta_id: z.string(),
          sta_name: z.string(),
          group_wil: z.number(),
          fg_enable: z.number(),
        }),
      ),
    })

    const parsed = schema.parse(req)

    const filterdStation = parsed.data.filter((d) => !d.sta_id.includes("WIL"))

    const insert = await db
      .insert(dbSchema.station)
      .values(
        filterdStation.map((s) => {
          return {
            id: s.sta_id,
            name: s.sta_name,
            fgEnable: s.fg_enable,
            daop: s.group_wil === 0 ? 1 : s.group_wil,
          }
        }),
      )
      .onConflictDoUpdate({
        target: dbSchema.station.id,
        set: {
          updatedAt: new Date().toISOString(),
          id: sql`excluded.id`,
          name: sql`excluded.name`,
          daop: sql`excluded.daop`,
        },
      })
      .returning()

    logger.info(`[SYNC][STATION] Inserted ${insert.length} rows`)
    logger.info("[SYNC][STATION] Syncing station data finished")
  } catch (e) {
    logger.error("[SYNC][STATION] Error", e)
    throw new InternalServerError(handleError(e))
  }
}
