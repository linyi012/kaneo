import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTemplateTable } from "../../database/schema";

async function deleteTemplate(id: string, workspaceId: string) {
  const [deleted] = await db
    .delete(projectTemplateTable)
    .where(
      and(
        eq(projectTemplateTable.id, id),
        eq(projectTemplateTable.workspaceId, workspaceId),
      ),
    )
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Template not found" });
  }

  return deleted;
}

export default deleteTemplate;
