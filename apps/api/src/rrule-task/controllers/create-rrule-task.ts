import { eq, max } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  projectTable,
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
import getNextRruleTaskNumber from "./get-next-rrule-task-number";

type CreateRruleTaskInput = {
  projectId: string;
  createdByUserId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  userId?: string;
  startDate?: Date;
  dueDaysOffset?: number | null;
  rrule: string;
  labels?: { name: string; color: string }[];
};

async function createRruleTask(input: CreateRruleTaskInput) {
  const [project] = await db
    .select({ id: projectTable.id })
    .from(projectTable)
    .where(eq(projectTable.id, input.projectId))
    .limit(1);

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const resolvedStatus = input.status || "to-do";
  const resolvedPriority = input.priority || "no-priority";

  assertValidRruleTaskStatus(resolvedStatus);
  assertValidRruleTaskPriority(resolvedPriority);
  assertValidDueDaysOffset(input.dueDaysOffset);

  const nextNumber = await getNextRruleTaskNumber(input.projectId);

  const [maxPositionResult] = await db
    .select({ maxPosition: max(rruleTaskTable.position) })
    .from(rruleTaskTable)
    .where(eq(rruleTaskTable.projectId, input.projectId));

  const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;
  const nextRunAt = computeNextRunAt(input.rrule, new Date());

  const [createdTask] = await db
    .insert(rruleTaskTable)
    .values({
      projectId: input.projectId,
      title: input.title || "",
      description: input.description || "",
      status: resolvedStatus,
      priority: resolvedPriority,
      userId: input.userId || null,
      createdByUserId: input.createdByUserId,
      startDate: input.startDate || null,
      dueDaysOffset: input.dueDaysOffset ?? null,
      rrule: input.rrule,
      nextRunAt,
      number: nextNumber + 1,
      position: nextPosition,
    })
    .returning();

  if (!createdTask) {
    throw new HTTPException(500, { message: "Failed to create RRule task" });
  }

  if (input.labels?.length) {
    for (const label of input.labels) {
      await db.insert(rruleTaskLabelTable).values({
        rruleTaskId: createdTask.id,
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
    .from(rruleTaskLabelTable)
    .where(eq(rruleTaskLabelTable.rruleTaskId, createdTask.id));

  return {
    ...createdTask,
    assigneeName: assignee?.name ?? null,
    assigneeId: createdTask.userId,
    labels,
  };
}

export default createRruleTask;
