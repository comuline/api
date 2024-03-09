CREATE TABLE IF NOT EXISTS "schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"station_id" text DEFAULT NULL,
	"train_id" text DEFAULT NULL,
	"line" text DEFAULT NULL,
	"route" text DEFAULT NULL,
	"color" text DEFAULT NULL,
	"destination" text DEFAULT NULL,
	"time_estimated" time DEFAULT NULL,
	"destination_time" time DEFAULT NULL,
	"updated_at" text DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT "schedule_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "station" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT NULL,
	"daop" integer DEFAULT NULL,
	"fg_enable" integer DEFAULT NULL,
	"have_schedule" boolean DEFAULT true,
	"updated_at" text DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT "station_id_unique" UNIQUE("id")
);
