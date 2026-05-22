import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  projectTemplateTable,
  projectTemplateTaskTable,
} from "../../database/schema";

async function deleteTemplateTask(id: string, workspaceId: string) {
  const [existingTask] = await db
    .select({ id: projectTemplateTaskTable.id })
    .from(projectTemplateTaskTable)
    .innerJoin(
      projectTemplateTable,
      eq(projectTemplateTaskTable.templateId, projectTemplateTable.id),
    )
    .where(
      and(
        eq(projectTemplateTaskTable.id, id),
        eq(projectTemplateTable.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!existingTask) {
    throw new HTTPException(404, { message: "Template task not found" });
  }

  const [deleted] = await db
    .delete(projectTemplateTaskTable)
    .where(eq(projectTemplateTaskTable.id, id))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Template task not found" });
  }

  return deleted;
}

export default deleteTemplateTask;
