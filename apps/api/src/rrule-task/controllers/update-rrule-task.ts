import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  rruleTaskLabelTable,
  rruleTaskTable,
  userTable,
} from "../../database/schema";
import { assertValidDueDaysOffset } from "../../project-template/template-due-date";
import { computeNextRunAt } from "../compute-next-run-at";
import {
  assertValidRruleTaskPriority,
  assertValidRruleTaskStatus,
} from "../validate-rrule-task-fields";

type UpdateRruleTaskInput = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId?: string | null;
  startDate?: Date | null;
  dueDaysOffset?: number | null;
  rrule: string;
  position: number;
  labels?: { name: string; color: string }[];
};

async function updateRruleTask(input: UpdateRruleTaskInput) {
  assertValidRruleTaskStatus(input.status);
  assertValidRruleTaskPriority(input.priority);
  assertValidDueDaysOffset(input.dueDaysOffset);

  const nextRunAt = computeNextRunAt(input.rrule, new Date());

  const [updatedTask] = await db
    .update(rruleTaskTable)
    .set({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      userId: input.userId || null,
      startDate: input.startDate ?? null,
      dueDaysOffset: input.dueDaysOffset ?? null,
      rrule: input.rrule,
      nextRunAt,
      position: input.position,
    })
    .where(eq(rruleTaskTable.id, input.id))
    .returning();

  if (!updatedTask) {
    throw new HTTPException(404, { message: "RRule task not found" });
  }

  if (input.labels !== undefined) {
    await db
      .delete(rruleTaskLabelTable)
      .where(eq(rruleTaskLabelTable.rruleTaskId, input.id));

    for (const label of input.labels) {
      await db.insert(rruleTaskLabelTable).values({
        rruleTaskId: input.id,
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
    .from(rruleTaskLabelTable)
    .where(eq(rruleTaskLabelTable.rruleTaskId, input.id));

  return {
    ...updatedTask,
    assigneeName: assignee?.name ?? null,
    assigneeId: updatedTask.userId,
    labels,
  };
}

export default updateRruleTask;
