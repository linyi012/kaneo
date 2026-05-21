import { and, asc, eq, max } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  columnTable,
  labelTable,
  projectTemplateTable,
  projectTemplateTaskLabelTable,
  projectTemplateTaskTable,
  taskTable,
} from "../../database/schema";
import createProject from "../../project/controllers/create-project";
import { coercePriority, coerceStatus } from "../../task/validate-task-fields";

async function createProjectFromTemplate({
  templateId,
  workspaceId,
  name,
  icon,
  slug,
}: {
  templateId: string;
  workspaceId: string;
  name: string;
  icon: string;
  slug: string;
}) {
  const [template] = await db
    .select()
    .from(projectTemplateTable)
    .where(
      and(
        eq(projectTemplateTable.id, templateId),
        eq(projectTemplateTable.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!template) {
    throw new HTTPException(404, { message: "Template not found" });
  }

  const createdProject = await createProject(workspaceId, name, icon, slug);

  if (!createdProject) {
    throw new HTTPException(500, { message: "Failed to create project" });
  }

  const columns = await db
    .select()
    .from(columnTable)
    .where(eq(columnTable.projectId, createdProject.id));

  const validStatuses = columns.map((c) => c.slug);

  const templateTasks = await db
    .select()
    .from(projectTemplateTaskTable)
    .where(eq(projectTemplateTaskTable.templateId, templateId))
    .orderBy(asc(projectTemplateTaskTable.position));

  for (const templateTask of templateTasks) {
    const { status } = coerceStatus(templateTask.status, validStatuses);
    const { priority } = coercePriority(
      templateTask.priority ?? "no-priority",
    );

    const column = columns.find((c) => c.slug === status);

    const [maxPositionResult] = await db
      .select({ maxPosition: max(taskTable.position) })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.projectId, createdProject.id),
          column?.id
            ? eq(taskTable.columnId, column.id)
            : eq(taskTable.status, status),
        ),
      );

    const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;

    const [createdTask] = await db
      .insert(taskTable)
      .values({
        projectId: createdProject.id,
        title: templateTask.title,
        description: templateTask.description ?? "",
        status,
        columnId: column?.id ?? null,
        priority,
        userId: templateTask.userId,
        startDate: templateTask.startDate,
        dueDate: templateTask.dueDate,
        number: templateTask.number ?? 1,
        position: nextPosition,
      })
      .returning();

    if (!createdTask) continue;

    const templateLabels = await db
      .select()
      .from(projectTemplateTaskLabelTable)
      .where(
        eq(projectTemplateTaskLabelTable.templateTaskId, templateTask.id),
      );

    for (const label of templateLabels) {
      await db.insert(labelTable).values({
        taskId: createdTask.id,
        name: label.name,
        color: label.color,
      });
    }
  }

  return createdProject;
}

export default createProjectFromTemplate;
