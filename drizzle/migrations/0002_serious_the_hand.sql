ALTER TABLE "schedule" DROP CONSTRAINT "schedule_station_id_station_id_fk";
--> statement-breakpoint
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_station_origin_id_station_id_fk";
--> statement-breakpoint
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_station_destination_id_station_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_id_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."station"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_origin_id_station_id_fk" FOREIGN KEY ("station_origin_id") REFERENCES "public"."station"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_station_destination_id_station_id_fk" FOREIGN KEY ("station_destination_id") REFERENCES "public"."station"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
