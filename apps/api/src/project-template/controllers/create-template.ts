import db from "../../database";
import { projectTemplateTable } from "../../database/schema";

async function createTemplate(
  workspaceId: string,
  name: string,
  description?: string,
) {
  const [created] = await db
    .insert(projectTemplateTable)
    .values({
      workspaceId,
      name,
      description: description ?? null,
    })
    .returning();

  return created;
}

export default createTemplate;
