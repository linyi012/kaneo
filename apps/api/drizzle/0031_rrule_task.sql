CREATE TABLE "rrule_task" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"position" integer DEFAULT 0,
	"number" integer DEFAULT 1,
	"assignee_id" text,
	"created_by_user_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'to-do' NOT NULL,
	"priority" text DEFAULT 'low',
	"start_date" timestamp,
	"due_days_offset" integer,
	"rrule" text NOT NULL,
	"next_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rrule_task_label" (
	"id" text PRIMARY KEY NOT NULL,
	"rrule_task_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rrule_task" ADD CONSTRAINT "rrule_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "rrule_task" ADD CONSTRAINT "rrule_task_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "rrule_task" ADD CONSTRAINT "rrule_task_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "rrule_task_label" ADD CONSTRAINT "rrule_task_label_rrule_task_id_rrule_task_id_fk" FOREIGN KEY ("rrule_task_id") REFERENCES "public"."rrule_task"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
CREATE INDEX "rrule_task_projectId_idx" ON "rrule_task" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX "rrule_task_nextRunAt_idx" ON "rrule_task" USING btree ("next_run_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "rrule_task_project_number_unique" ON "rrule_task" USING btree ("project_id","number");
--> statement-breakpoint
CREATE INDEX "rrule_task_label_rruleTaskId_idx" ON "rrule_task_label" USING btree ("rrule_task_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "rrule_task_label_task_name_unique" ON "rrule_task_label" USING btree ("rrule_task_id","name");
