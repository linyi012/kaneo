import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTemplateTaskTable } from "../../database/schema";

async function deleteTemplateTask(id: string) {
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
