CREATE TABLE "project_template" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_template_task" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"position" integer DEFAULT 0,
	"number" integer DEFAULT 1,
	"assignee_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'to-do' NOT NULL,
	"priority" text DEFAULT 'low',
	"start_date" timestamp,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_template_task_template_number_unique" UNIQUE("template_id","number")
);
--> statement-breakpoint
CREATE TABLE "project_template_task_label" (
	"id" text PRIMARY KEY NOT NULL,
	"template_task_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_template_task_label_task_name_unique" UNIQUE("template_task_id","name")
);
--> statement-breakpoint
ALTER TABLE "project_template" ADD CONSTRAINT "project_template_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_template_task" ADD CONSTRAINT "project_template_task_template_id_project_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_template"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_template_task" ADD CONSTRAINT "project_template_task_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_template_task_label" ADD CONSTRAINT "project_template_task_label_template_task_id_project_template_task_id_fk" FOREIGN KEY ("template_task_id") REFERENCES "public"."project_template_task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "project_template_workspaceId_idx" ON "project_template" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "project_template_task_templateId_idx" ON "project_template_task" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "project_template_task_label_templateTaskId_idx" ON "project_template_task_label" USING btree ("template_task_id");
