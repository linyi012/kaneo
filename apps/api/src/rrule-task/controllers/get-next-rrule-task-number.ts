import { eq, max } from "drizzle-orm";
import db from "../../database";
import { rruleTaskTable } from "../../database/schema";

async function getNextRruleTaskNumber(projectId: string) {
  const [result] = await db
    .select({ maxNumber: max(rruleTaskTable.number) })
    .from(rruleTaskTable)
    .where(eq(rruleTaskTable.projectId, projectId));

  return result?.maxNumber ?? 0;
}

export default getNextRruleTaskNumber;
