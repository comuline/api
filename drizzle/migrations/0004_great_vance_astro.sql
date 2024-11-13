ALTER TABLE "schedule" ADD COLUMN "departs_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "arrives_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "schedule" DROP COLUMN IF EXISTS "time_departure";--> statement-breakpoint
ALTER TABLE "schedule" DROP COLUMN IF EXISTS "time_at_destination";