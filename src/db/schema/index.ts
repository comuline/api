import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
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

export const stationScheduleMetadata = z.object({
  /** Origin metadata */
  origin: z.object({
    color: z.string().nullable(),
  }),
})

export type StationScheduleMetadata = z.infer<typeof stationScheduleMetadata>

export const scheduleTable = pgTable(
  "schedule",
  {
    id: text("id").primaryKey().unique().notNull(),
    station_id: text("station_id")
      .notNull()
      .references(() => stationTable.id, {
        onDelete: "cascade",
      }),
    station_origin_id: text("station_origin_id").references(
      () => stationTable.id,
      {
        onDelete: "set null",
      },
    ),
    station_destination_id: text("station_destination_id").references(
      () => stationTable.id,
      {
        onDelete: "set null",
      },
    ),
    train_id: text("train_id").notNull(),
    line: text("line").notNull(),
    route: text("route").notNull(),
    time_departure: time("time_departure").notNull(),
    time_at_destination: time("time_at_destination").notNull(),
    metadata: jsonb("metadata").$type<StationScheduleMetadata>(),
    created_at: timestamp("created_at", {
      mode: "string",
      withTimezone: true,
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => {
    return {
      schedule_idx: uniqueIndex("schedule_idx").on(table.id),
      schedule_station_idx: index("schedule_station_idx").on(table.station_id),
    }
  },
)

export const scheduleTableRelations = relations(scheduleTable, ({ one }) => ({
  station: one(stationTable, {
    fields: [scheduleTable.station_id],
    references: [stationTable.id],
  }),
  station_origin: one(stationTable, {
    fields: [scheduleTable.station_origin_id],
    references: [stationTable.id],
  }),
  station_destination: one(stationTable, {
    fields: [scheduleTable.station_destination_id],
    references: [stationTable.id],
  }),
}))

export const stationSchema = createSelectSchema(stationTable)

export type NewStation = typeof stationTable.$inferInsert

export type Station = z.infer<typeof stationSchema>

export type StationType = Station["type"]

export const scheduleSchema = createSelectSchema(scheduleTable, {
  metadata: stationScheduleMetadata.nullable(),
})

export type Schedule = z.infer<typeof scheduleSchema>

export type NewSchedule = typeof scheduleTable.$inferInsert
