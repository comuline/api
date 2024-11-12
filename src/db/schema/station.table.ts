import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

/** Station Metadata */
const stationMetadata = z.object({
  /** Comuline metadata */
  has_schedule: z.boolean().nullable(),
  /** Origin metadata */
  origin: z.object({
    /** KRL */
    daop: z.number().nullable(),
    fg_enable: z.number().nullable(),
  }),
})

export type StationMetadata = z.infer<typeof stationMetadata>

export const stationTypeEnum = pgEnum("station_type", [
  "KRL",
  "MRT",
  "LRT",
  "LOCAL",
])

export const stationTable = pgTable(
  "station",
  {
    uid: text("uid").primaryKey().unique().notNull(),
    id: text("id").unique().notNull(),
    name: text("name").notNull(),
    type: stationTypeEnum("type").notNull(),
    metadata: jsonb("metadata").$type<StationMetadata>(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => {
    return {
      station_uidx: uniqueIndex("station_uidx").on(table.uid),
      station_idx: index("station_idx").on(table.id),
      type_idx: index("station_type_idx").on(table.type),
    }
  },
)

export const stationSchema = createSelectSchema(stationTable)

export type NewStation = typeof stationTable.$inferInsert

export type Station = z.infer<typeof stationSchema>

export type StationType = Station["type"]
