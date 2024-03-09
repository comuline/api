import { sql } from "drizzle-orm"
import { boolean, integer, pgTable, text, time } from "drizzle-orm/pg-core"

export const schedule = pgTable("schedule", {
  id: text("id").primaryKey().unique(),
  stationId: text("station_id").default(sql`NULL`),
  trainId: text("train_id").default(sql`NULL`),
  line: text("line").default(sql`NULL`),
  route: text("route").default(sql`NULL`),
  color: text("color").default(sql`NULL`),
  destination: text("destination").default(sql`NULL`),
  timeEstimated: time("time_estimated").default(sql`NULL`),
  destinationTime: time("destination_time").default(sql`NULL`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
})

export const station = pgTable("station", {
  id: text("id").primaryKey().unique(),
  name: text("name").default(sql`NULL`),
  daop: integer("daop").default(sql`NULL`),
  fgEnable: integer("fg_enable").default(sql`NULL`),
  haveSchedule: boolean("have_schedule").default(sql`true`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
})
