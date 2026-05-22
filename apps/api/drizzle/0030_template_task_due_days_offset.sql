ALTER TABLE "project_template_task" ADD COLUMN "due_days_offset" integer;--> statement-breakpoint
ALTER TABLE "project_template_task" DROP COLUMN "due_date";
