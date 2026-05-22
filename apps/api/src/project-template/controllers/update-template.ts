import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTemplateTable } from "../../database/schema";

async function updateTemplate(
  id: string,
  workspaceId: string,
  data: { name?: string; description?: string | null },
) {
  const [updated] = await db
    .update(projectTemplateTable)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
    })
    .where(
      and(
        eq(projectTemplateTable.id, id),
        eq(projectTemplateTable.workspaceId, workspaceId),
      ),
    )
    .returning();

  if (!updated) {
    throw new HTTPException(404, { message: "Template not found" });
  }

  return updated;
}

export default updateTemplate;
