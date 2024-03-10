import { sql } from "drizzle-orm"
import { db, dbSchema } from "../../db"
import { NewSync, sync } from "../../db/schema"
import { handleError } from "../../utils/error"

/** A function wrapper utils to handle syncing status */
export const syncWrapper =
  (
    fn: () => Promise<void>,
    {
      item,
      type,
    }: {
      // TODO: Change to infer type from dbSchema.sync
      type: "cron" | "manual"
      item: "station" | "schedule"
    }
  ) =>
  async () => {
    const start = await db
      .insert(dbSchema.sync)
      .values({
        item,
        type,
      })
      .returning({ id: dbSchema.sync.id, n: dbSchema.sync.n })

    const initalPayload = start[0]
    const startTime = performance.now()

    fn()
      .then(async () => {
        const payload: Partial<NewSync> = {
          ...initalPayload,
          status: "SUCCESS",
        }
        await db
          .insert(dbSchema.sync)
          .values(payload)
          .onConflictDoUpdate({
            target: dbSchema.sync.id,
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
          .insert(dbSchema.sync)
          .values(payload)
          .onConflictDoUpdate({
            target: dbSchema.sync.id,
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
          .insert(dbSchema.sync)
          .values(payload)
          .onConflictDoUpdate({
            target: dbSchema.sync.id,
            set: {
              endedAt: sql`excluded.ended_at`,
              duration: sql`excluded.duration`,
            },
          })
      })

    return {
      id: initalPayload.id,
      type,
      item,
      status: "PENDING",
    }
  }
