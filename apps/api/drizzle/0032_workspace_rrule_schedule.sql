ALTER TABLE "workspace" ADD COLUMN "rrule_timezone" text DEFAULT 'UTC' NOT NULL;
--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "rrule_run_at_hour" integer DEFAULT 9 NOT NULL;
--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "rrule_run_at_minute" integer DEFAULT 0 NOT NULL;
