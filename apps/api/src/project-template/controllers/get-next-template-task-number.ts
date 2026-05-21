import { eq, max } from "drizzle-orm";
import db from "../../database";
import { projectTemplateTaskTable } from "../../database/schema";

async function getNextTemplateTaskNumber(templateId: string) {
  const [result] = await db
    .select({ maxNumber: max(projectTemplateTaskTable.number) })
    .from(projectTemplateTaskTable)
    .where(eq(projectTemplateTaskTable.templateId, templateId));

  return result?.maxNumber ?? 0;
}

export default getNextTemplateTaskNumber;
