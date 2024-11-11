CREATE TABLE IF NOT EXISTS "schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"station_origin_id" text,
	"station_origin_name" text NOT NULL,
	"station_destination_id" text,
	"station_destination_name" text NOT NULL,
	"train_id" text NOT NULL,
	"line" text NOT NULL,
	"route" text NOT NULL,
	"time_departure" time NOT NULL,
	"time_at_destination" time NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "schedule_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "schedule_idx" ON "schedule" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_station_idx" ON "schedule" USING btree ("station_id");