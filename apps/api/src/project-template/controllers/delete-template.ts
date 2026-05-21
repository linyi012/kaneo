import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTemplateTable } from "../../database/schema";

async function deleteTemplate(id: string) {
  const [deleted] = await db
    .delete(projectTemplateTable)
    .where(eq(projectTemplateTable.id, id))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Template not found" });
  }

  return deleted;
}

export default deleteTemplate;
