import { HTTPException } from "hono/http-exception";

export const MAX_DUE_DAYS_OFFSET = 3650;

export function assertValidDueDaysOffset(
  offset: number | null | undefined,
): void {
  if (offset === null || offset === undefined) return;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new HTTPException(400, {
      message: "dueDaysOffset must be a non-negative integer",
    });
  }
  if (offset > MAX_DUE_DAYS_OFFSET) {
    throw new HTTPException(400, {
      message: `dueDaysOffset must be at most ${MAX_DUE_DAYS_OFFSET}`,
    });
  }
}

export function resolveTemplateTaskDueDate(
  projectBase: Date,
  dueDaysOffset: number | null | undefined,
): Date | null {
  if (dueDaysOffset === null || dueDaysOffset === undefined) {
    return null;
  }
  const result = new Date(projectBase);
  result.setDate(result.getDate() + dueDaysOffset);
  return result;
}
