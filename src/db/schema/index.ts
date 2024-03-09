import { sql } from "drizzle-orm"
import {
  bigint,
  bigserial,
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  uuid,
} from "drizzle-orm/pg-core"

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

export const syncFromEnum = pgEnum("sync_from", ["cron", "manual"])
export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "success",
  "failed",
])

export const syncItemEnum = pgEnum("sync_item", ["station", "schedule"])

export const sync = pgTable("sync", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  n: bigserial("n", { mode: "number" }),
  type: syncFromEnum("type").default("manual"),
  status: syncStatusEnum("status").default("pending"),
  item: syncItemEnum("item"),
  duration: bigint("duration", {
    mode: "number",
  }).default(0),
  message: text("message").default(sql`NULL`),
  startedAt: text("started_at").default(sql`(CURRENT_TIMESTAMP)`),
  endedAt: text("ended_at").default(sql`NULL`),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
})

export type NewSync = typeof sync.$inferInsert
