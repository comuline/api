import {
  index,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { stationTable } from "./station.table"
import { relations } from "drizzle-orm"

export const stationScheduleMetadata = z.object({
  /** Origin metadata */
  active_schedule: z.boolean().default(true),
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
    station_origin_id: text("station_origin_id")
      .notNull()
      .references(() => stationTable.id, {
        onDelete: "cascade",
      }),
    station_destination_id: text("station_destination_id")
      .references(() => stationTable.id, {
        onDelete: "set null",
      })
      .notNull(),
    train_id: text("train_id").notNull(),
    line: text("line").notNull(),
    route: text("route").notNull(),
    departs_at: timestamp("departs_at", {
      mode: "string",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    arrives_at: timestamp("arrives_at", {
      mode: "string",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata").$type<StationScheduleMetadata>(),
    created_at: timestamp("created_at", {
      mode: "string",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      schedule_idx: uniqueIndex("schedule_idx").on(table.id),
      schedule_station_idx: index("schedule_station_idx").on(table.station_id),
      schedule_train_idx: index("schedule_train_idx").on(table.train_id),
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

export const scheduleSchema = createSelectSchema(scheduleTable, {
  metadata: stationScheduleMetadata.nullable(),
})

export type Schedule = z.infer<typeof scheduleSchema>

export type NewSchedule = typeof scheduleTable.$inferInsert
