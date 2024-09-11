import { sql } from "drizzle-orm"
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

const stationMetadata = z.object({
  /** KRL Metadata */
  daop: z.number().nullable(),
  fgEnable: z.number().nullable(),
  haveSchedule: z.boolean().nullable(),
})

export type StationMetadata = z.infer<typeof stationMetadata>

export const station = sqliteTable(
  "station",
  {
    id: text("id").primaryKey().unique(),
    name: text("name").notNull(),
    type: text("type", {
      /* Station type */
      enum: ["KRL", "MRT", "LRT"],
    }).notNull(),
    metadata: text("metadata", {
      mode: "json",
    }).$type<StationMetadata>(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      stationIdx: index("station_idx").on(table.id),
      typeIdx: index("station_type_idx").on(table.type),
    }
  },
)

export const stationSchema = createSelectSchema(station)

export type NewStation = typeof station.$inferInsert

export type Station = z.infer<typeof stationSchema>
