import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  projectTemplateTaskLabelTable,
  projectTemplateTaskTable,
  userTable,
} from "../../database/schema";

async function getTemplateTask(taskId: string) {
  const [task] = await db
    .select({
      id: projectTemplateTaskTable.id,
      templateId: projectTemplateTaskTable.templateId,
      title: projectTemplateTaskTable.title,
      number: projectTemplateTaskTable.number,
      description: projectTemplateTaskTable.description,
      status: projectTemplateTaskTable.status,
      priority: projectTemplateTaskTable.priority,
      startDate: projectTemplateTaskTable.startDate,
      dueDaysOffset: projectTemplateTaskTable.dueDaysOffset,
      position: projectTemplateTaskTable.position,
      createdAt: projectTemplateTaskTable.createdAt,
      updatedAt: projectTemplateTaskTable.updatedAt,
      userId: projectTemplateTaskTable.userId,
      assigneeName: userTable.name,
      assigneeId: userTable.id,
    })
    .from(projectTemplateTaskTable)
    .leftJoin(userTable, eq(projectTemplateTaskTable.userId, userTable.id))
    .where(eq(projectTemplateTaskTable.id, taskId))
    .limit(1);

  if (!task) {
    throw new HTTPException(404, { message: "Template task not found" });
  }

  const labels = await db
    .select()
    .from(projectTemplateTaskLabelTable)
    .where(eq(projectTemplateTaskLabelTable.templateTaskId, taskId));

  return { ...task, labels };
}

export default getTemplateTask;
