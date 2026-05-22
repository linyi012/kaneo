export function resolveDueDateFromOffset(
  base: Date,
  dueDaysOffset: number | null | undefined,
): Date | null {
  if (dueDaysOffset === null || dueDaysOffset === undefined) {
    return null;
  }
  const result = new Date(base);
  result.setDate(result.getDate() + dueDaysOffset);
  return result;
}
