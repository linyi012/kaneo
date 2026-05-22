import { asc, eq } from "drizzle-orm";
import db from "../../database";
import {
  projectTable,
  rruleTaskLabelTable,
  rruleTaskTable,
  userTable,
} from "../../database/schema";

async function getRruleTasksByWorkspace(workspaceId: string) {
  const projects = await db
    .select({
      id: projectTable.id,
      name: projectTable.name,
      slug: projectTable.slug,
      icon: projectTable.icon,
    })
    .from(projectTable)
    .where(eq(projectTable.workspaceId, workspaceId))
    .orderBy(asc(projectTable.name));

  const result = [];

  for (const project of projects) {
    const tasks = await db
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
      .where(eq(rruleTaskTable.projectId, project.id))
      .orderBy(asc(rruleTaskTable.position));

    const tasksWithLabels = [];

    for (const task of tasks) {
      const labels = await db
        .select()
        .from(rruleTaskLabelTable)
        .where(eq(rruleTaskLabelTable.rruleTaskId, task.id));

      tasksWithLabels.push({ ...task, labels });
    }

    result.push({ ...project, rruleTasks: tasksWithLabels });
  }

  return result;
}

export default getRruleTasksByWorkspace;
