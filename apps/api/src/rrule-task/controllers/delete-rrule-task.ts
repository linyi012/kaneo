import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { rruleTaskTable } from "../../database/schema";

async function deleteRruleTask(id: string) {
  const [deleted] = await db
    .delete(rruleTaskTable)
    .where(eq(rruleTaskTable.id, id))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "RRule task not found" });
  }

  return deleted;
}

export default deleteRruleTask;
