import { eq } from "drizzle-orm";
import db from "../../database";
import {
  labelTable,
  projectTable,
  rruleTaskLabelTable,
  rruleTaskTable,
} from "../../database/schema";
import { resolveDueDateFromOffset } from "../../shared/resolve-due-date";
import createTask from "../../task/controllers/create-task";
import { advanceNextRunAtAfter } from "../compute-next-run-at";

type RruleTaskRow = typeof rruleTaskTable.$inferSelect;

async function executeRruleTask(
  row: RruleTaskRow,
  occurrence: Date,
): Promise<void> {
  const [project] = await db
    .select({ workspaceId: projectTable.workspaceId })
    .from(projectTable)
    .where(eq(projectTable.id, row.projectId))
    .limit(1);

  if (!project) {
    return;
  }

  const dueDate = resolveDueDateFromOffset(occurrence, row.dueDaysOffset);
  const currentUserId = row.userId ?? row.createdByUserId ?? "";

  const createdTask = await createTask({
    projectId: row.projectId,
    currentUserId,
    userId: row.userId ?? undefined,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority ?? "no-priority",
    startDate: row.startDate ?? occurrence,
    dueDate: dueDate ?? undefined,
  });

  const templateLabels = await db
    .select()
    .from(rruleTaskLabelTable)
    .where(eq(rruleTaskLabelTable.rruleTaskId, row.id));

  for (const label of templateLabels) {
    await db.insert(labelTable).values({
      taskId: createdTask.id,
      name: label.name,
      color: label.color,
      workspaceId: project.workspaceId,
    });
  }
}

export async function processOneRruleTask(row: RruleTaskRow): Promise<void> {
  const now = new Date();
  const occurrence = row.nextRunAt;

  if (!occurrence || occurrence > now) {
    return;
  }

  await executeRruleTask(row, occurrence);

  const nextRunAt = advanceNextRunAtAfter(row.rrule, occurrence, now);

  await db
    .update(rruleTaskTable)
    .set({ nextRunAt })
    .where(eq(rruleTaskTable.id, row.id));
}

export default executeRruleTask;
