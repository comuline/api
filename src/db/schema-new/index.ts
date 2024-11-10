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

/** Station Metadata */
const stationMetadata = z.object({
  /** Comuline metadata */
  has_schedule: z.boolean().nullable(),
  /** Original metadata */
  original: z.object({
    /** KRL */
    daop: z.number().nullable(),
    fg_enable: z.number().nullable(),
  }),
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
    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => {
    return {
      station_uidx: index("station_uidx").on(table.uid),
      station_idx: index("station_idx").on(table.id),
      type_idx: index("station_type_idx").on(table.type),
    }
  },
)

export const stationSchema = createSelectSchema(station)

export type NewStation = typeof station.$inferInsert

export type Station = z.infer<typeof stationSchema>
