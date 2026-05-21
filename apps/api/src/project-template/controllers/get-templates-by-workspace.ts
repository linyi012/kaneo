import { asc, eq } from "drizzle-orm";
import db from "../../database";
import {
  projectTemplateTable,
  projectTemplateTaskLabelTable,
  projectTemplateTaskTable,
  userTable,
} from "../../database/schema";

async function getTemplatesByWorkspace(workspaceId: string) {
  const templates = await db
    .select()
    .from(projectTemplateTable)
    .where(eq(projectTemplateTable.workspaceId, workspaceId))
    .orderBy(asc(projectTemplateTable.name));

  const result = [];

  for (const template of templates) {
    const tasks = await db
      .select({
        id: projectTemplateTaskTable.id,
        templateId: projectTemplateTaskTable.templateId,
        title: projectTemplateTaskTable.title,
        number: projectTemplateTaskTable.number,
        description: projectTemplateTaskTable.description,
        status: projectTemplateTaskTable.status,
        priority: projectTemplateTaskTable.priority,
        startDate: projectTemplateTaskTable.startDate,
        dueDate: projectTemplateTaskTable.dueDate,
        position: projectTemplateTaskTable.position,
        createdAt: projectTemplateTaskTable.createdAt,
        updatedAt: projectTemplateTaskTable.updatedAt,
        userId: projectTemplateTaskTable.userId,
        assigneeName: userTable.name,
        assigneeId: userTable.id,
      })
      .from(projectTemplateTaskTable)
      .leftJoin(
        userTable,
        eq(projectTemplateTaskTable.userId, userTable.id),
      )
      .where(eq(projectTemplateTaskTable.templateId, template.id))
      .orderBy(asc(projectTemplateTaskTable.position));

    const tasksWithLabels = [];

    for (const task of tasks) {
      const labels = await db
        .select()
        .from(projectTemplateTaskLabelTable)
        .where(eq(projectTemplateTaskLabelTable.templateTaskId, task.id));

      tasksWithLabels.push({ ...task, labels });
    }

    result.push({ ...template, tasks: tasksWithLabels });
  }

  return result;
}

export default getTemplatesByWorkspace;
