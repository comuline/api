DO $$ BEGIN
 CREATE TYPE "sync_from" AS ENUM('cron', 'manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "sync_item" AS ENUM('station', 'schedule');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "sync_status" AS ENUM('pending', 'success', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"n" bigserial NOT NULL,
	"type" "sync_from" DEFAULT 'manual',
	"status" "sync_status" DEFAULT 'pending',
	"item" "sync_item",
	"duration" bigint DEFAULT 0,
	"message" text DEFAULT NULL,
	"started_at" text DEFAULT (CURRENT_TIMESTAMP),
	"ended_at" text DEFAULT NULL,
	"created_at" text DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT "sync_id_unique" UNIQUE("id")
);
