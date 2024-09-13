import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

const stationMetadata = z.object({
  /** KRL Metadata */
  daop: z.number().nullable(),
  fgEnable: z.number().nullable(),
  haveSchedule: z.boolean().nullable(),
})

export type StationMetadata = z.infer<typeof stationMetadata>

export const stationTypeEnum = pgEnum("station_type", ["KRL", "MRT", "LRT"])

export const station = pgTable(
  "station",
  {
    uid: text("uid").primaryKey().unique().notNull(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    type: stationTypeEnum("type").notNull(),
    metadata: jsonb("metadata").$type<StationMetadata>(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => {
    return {
      stationUidx: index("station_uidx").on(table.uid),
      stationIdx: index("station_idx").on(table.id),
      typeIdx: index("station_type_idx").on(table.type),
    }
  },
)

export const stationSchema = createSelectSchema(station)

export type NewStation = typeof station.$inferInsert

export type Station = z.infer<typeof stationSchema>
