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
  /** Original metadata */
  /** TODO: Change to origin */
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

const stationScheduleMetadata = z.object({
  /** Origin metadata */
  origin: z.object({
    color: z.string().nullable(),
  }),
})

export type StationScheduleMetadata = z.infer<typeof stationScheduleMetadata>

export const schedule = pgTable(
  "schedule",
  {
    id: text("id").primaryKey().unique().notNull(),
    station_id: text("station_id").notNull(),
    station_origin_id: text("station_origin_id"),
    station_origin_name: text("station_origin_name").notNull(),
    station_destination_id: text("station_destination_id"),
    station_destination_name: text("station_destination_name").notNull(),
    train_id: text("train_id").notNull(),
    line: text("line").notNull(),
    route: text("route").notNull(),
    time_departure: time("time_departure").notNull(),
    time_at_destination: time("time_at_destination").notNull(),
    metadata: jsonb("metadata").$type<StationScheduleMetadata>(),
    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => {
    return {
      schedule_idx: uniqueIndex("schedule_idx").on(table.id),
      schedule_station_idx: index("schedule_station_idx").on(table.station_id),
    }
  },
)

export const stationSchema = createSelectSchema(station)

export type NewStation = typeof station.$inferInsert

export type Station = z.infer<typeof stationSchema>

export type StationType = Station["type"]

export const scheduleSchema = createSelectSchema(schedule, {
  metadata: stationScheduleMetadata.nullable(),
})

export type ScheduleType = z.infer<typeof scheduleSchema>

type Json = ScheduleType["metadata"]
