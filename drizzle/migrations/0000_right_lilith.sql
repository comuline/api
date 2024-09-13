DO $$ BEGIN
 CREATE TYPE "public"."station_type" AS ENUM('KRL', 'MRT', 'LRT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "station" (
	"uid" text PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"name" text NOT NULL,
	"type" "station_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "station_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_uidx" ON "station" USING btree ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_idx" ON "station" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_type_idx" ON "station" USING btree ("type");