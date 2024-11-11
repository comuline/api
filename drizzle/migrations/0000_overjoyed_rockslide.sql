DO $$ BEGIN
 CREATE TYPE "public"."station_type" AS ENUM('KRL', 'MRT', 'LRT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"station_origin_id" text,
	"station_destination_id" text,
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
CREATE TABLE IF NOT EXISTS "station" (
	"uid" text PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"name" text NOT NULL,
	"type" "station_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "station_uid_unique" UNIQUE("uid"),
	CONSTRAINT "station_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_id_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."station"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_origin_id_station_id_fk" FOREIGN KEY ("station_origin_id") REFERENCES "public"."station"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_destination_id_station_id_fk" FOREIGN KEY ("station_destination_id") REFERENCES "public"."station"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "schedule_idx" ON "schedule" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_station_idx" ON "schedule" USING btree ("station_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "station_uidx" ON "station" USING btree ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_idx" ON "station" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_type_idx" ON "station" USING btree ("type");