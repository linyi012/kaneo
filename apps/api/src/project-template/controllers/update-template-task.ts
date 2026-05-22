import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  projectTemplateTaskLabelTable,
  projectTemplateTaskTable,
  userTable,
} from "../../database/schema";
import { assertValidDueDaysOffset } from "../template-due-date";
import {
  assertValidTemplatePriority,
  assertValidTemplateStatus,
} from "../validate-template-task-fields";

type UpdateTemplateTaskInput = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId?: string | null;
  startDate?: Date | null;
  dueDaysOffset?: number | null;
  position: number;
  labels?: { name: string; color: string }[];
};

async function updateTemplateTask(input: UpdateTemplateTaskInput) {
  assertValidTemplateStatus(input.status);
  assertValidTemplatePriority(input.priority);
  assertValidDueDaysOffset(input.dueDaysOffset);

  const [updatedTask] = await db
    .update(projectTemplateTaskTable)
    .set({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      userId: input.userId || null,
      startDate: input.startDate ?? null,
      dueDaysOffset: input.dueDaysOffset ?? null,
      position: input.position,
    })
    .where(eq(projectTemplateTaskTable.id, input.id))
    .returning();

  if (!updatedTask) {
    throw new HTTPException(404, { message: "Template task not found" });
  }

  if (input.labels !== undefined) {
    await db
      .delete(projectTemplateTaskLabelTable)
      .where(eq(projectTemplateTaskLabelTable.templateTaskId, input.id));

    for (const label of input.labels) {
      await db.insert(projectTemplateTaskLabelTable).values({
        templateTaskId: input.id,
        name: label.name,
        color: label.color,
      });
    }
  }

  const [assignee] = await db
    .select({ name: userTable.name })
    .from(userTable)
    .where(eq(userTable.id, updatedTask.userId ?? ""));

  const labels = await db
    .select()
    .from(projectTemplateTaskLabelTable)
    .where(eq(projectTemplateTaskLabelTable.templateTaskId, input.id));

  return {
    ...updatedTask,
    assigneeName: assignee?.name ?? null,
    assigneeId: updatedTask.userId,
    labels,
  };
}

export default updateTemplateTask;
