import { sql } from "drizzle-orm"
import { db } from "../../db"
import { NewSync, sync } from "../../db/schema"
import { handleError } from "../../utils/error"
import { syncStation } from "./station"

export const syncService = {
  station: async () => {
    const start = await db
      .insert(sync)
      .values({
        item: "station",
        // Un-comment the line below if using cron (use context)
        /*       type: "cron" */
      })
      .returning({ id: sync.id, n: sync.n })

    const initalPayload = start[0]
    const startTime = performance.now()

    syncStation()
      .then(async () => {
        const payload: Partial<NewSync> = {
          ...initalPayload,
          status: "SUCCESS",
        }
        await db
          .insert(sync)
          .values(payload)
          .onConflictDoUpdate({
            target: sync.id,
            set: {
              status: sql`excluded.status`,
            },
          })
      })
      .catch(async (e) => {
        const error = handleError(e)

        const payload: Partial<NewSync> = {
          ...initalPayload,
          status: "FAILED",
          message: error,
        }

        await db
          .insert(sync)
          .values(payload)
          .onConflictDoUpdate({
            target: sync.id,
            set: {
              status: sql`excluded.status`,
              message: sql`excluded.message`,
            },
          })
      })
      .finally(async () => {
        const endTime = performance.now()
        const duration = Math.ceil(endTime - startTime)

        const payload: Partial<NewSync> = {
          ...initalPayload,
          endedAt: new Date().toISOString(),
          duration,
        }

        await db
          .insert(sync)
          .values(payload)
          .onConflictDoUpdate({
            target: sync.id,
            set: {
              endedAt: sql`excluded.ended_at`,
              duration: sql`excluded.duration`,
            },
          })
      })
    return {
      status: 200,
      data: {
        status: "PENDING",
      },
      message: "Syncing data station",
    }
  },
}
