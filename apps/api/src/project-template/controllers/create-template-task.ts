import { eq, max } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  projectTemplateTaskLabelTable,
  projectTemplateTaskTable,
  userTable,
} from "../../database/schema";
import {
  assertValidTemplatePriority,
  assertValidTemplateStatus,
} from "../validate-template-task-fields";
import getNextTemplateTaskNumber from "./get-next-template-task-number";

type CreateTemplateTaskInput = {
  templateId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  userId?: string;
  startDate?: Date;
  dueDate?: Date;
  labels?: { name: string; color: string }[];
};

async function createTemplateTask(input: CreateTemplateTaskInput) {
  const resolvedStatus = input.status || "to-do";
  const resolvedPriority = input.priority || "no-priority";

  assertValidTemplateStatus(resolvedStatus);
  assertValidTemplatePriority(resolvedPriority);

  const nextNumber = await getNextTemplateTaskNumber(input.templateId);

  const [maxPositionResult] = await db
    .select({ maxPosition: max(projectTemplateTaskTable.position) })
    .from(projectTemplateTaskTable)
    .where(eq(projectTemplateTaskTable.templateId, input.templateId));

  const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;

  const [createdTask] = await db
    .insert(projectTemplateTaskTable)
    .values({
      templateId: input.templateId,
      title: input.title || "",
      description: input.description || "",
      status: resolvedStatus,
      priority: resolvedPriority,
      userId: input.userId || null,
      startDate: input.startDate || null,
      dueDate: input.dueDate || null,
      number: nextNumber + 1,
      position: nextPosition,
    })
    .returning();

  if (!createdTask) {
    throw new HTTPException(500, { message: "Failed to create template task" });
  }

  if (input.labels?.length) {
    for (const label of input.labels) {
      await db.insert(projectTemplateTaskLabelTable).values({
        templateTaskId: createdTask.id,
        name: label.name,
        color: label.color,
      });
    }
  }

  const [assignee] = await db
    .select({ name: userTable.name })
    .from(userTable)
    .where(eq(userTable.id, createdTask.userId ?? ""));

  const labels = await db
    .select()
    .from(projectTemplateTaskLabelTable)
    .where(eq(projectTemplateTaskLabelTable.templateTaskId, createdTask.id));

  return {
    ...createdTask,
    assigneeName: assignee?.name ?? null,
    assigneeId: createdTask.userId,
    labels,
  };
}

export default createTemplateTask;
