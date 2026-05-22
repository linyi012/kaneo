import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  rruleTaskLabelTable,
  rruleTaskTable,
  userTable,
} from "../../database/schema";

async function getRruleTask(id: string) {
  const [task] = await db
    .select({
      id: rruleTaskTable.id,
      projectId: rruleTaskTable.projectId,
      title: rruleTaskTable.title,
      number: rruleTaskTable.number,
      description: rruleTaskTable.description,
      status: rruleTaskTable.status,
      priority: rruleTaskTable.priority,
      startDate: rruleTaskTable.startDate,
      dueDaysOffset: rruleTaskTable.dueDaysOffset,
      rrule: rruleTaskTable.rrule,
      nextRunAt: rruleTaskTable.nextRunAt,
      position: rruleTaskTable.position,
      createdAt: rruleTaskTable.createdAt,
      updatedAt: rruleTaskTable.updatedAt,
      userId: rruleTaskTable.userId,
      assigneeName: userTable.name,
      assigneeId: userTable.id,
    })
    .from(rruleTaskTable)
    .leftJoin(userTable, eq(rruleTaskTable.userId, userTable.id))
    .where(eq(rruleTaskTable.id, id));

  if (!task) {
    throw new HTTPException(404, { message: "RRule task not found" });
  }

  const labels = await db
    .select()
    .from(rruleTaskLabelTable)
    .where(eq(rruleTaskLabelTable.rruleTaskId, id));

  return { ...task, labels };
}

export default getRruleTask;
