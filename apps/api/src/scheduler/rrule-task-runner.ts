import { and, asc, isNotNull, lte, min } from "drizzle-orm";
import db from "../database";
import { rruleTaskTable } from "../database/schema";
import { processOneRruleTask } from "../rrule-task/controllers/execute-rrule-task";

let timer: ReturnType<typeof setTimeout> | null = null;
let isTickRunning = false;

export async function runDueRRuleTasks(): Promise<void> {
  const now = new Date();
  const dueRows = await db
    .select()
    .from(rruleTaskTable)
    .where(
      and(
        isNotNull(rruleTaskTable.nextRunAt),
        lte(rruleTaskTable.nextRunAt, now),
      ),
    )
    .orderBy(asc(rruleTaskTable.nextRunAt));

  for (const row of dueRows) {
    await processOneRruleTask(row);
  }
}

async function scheduleNextWake(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  const [result] = await db
    .select({ next: min(rruleTaskTable.nextRunAt) })
    .from(rruleTaskTable)
    .where(isNotNull(rruleTaskTable.nextRunAt));

  const next = result?.next;
  if (!next) {
    return;
  }

  const delay = Math.max(0, next.getTime() - Date.now());
  timer = setTimeout(() => {
    void tick();
  }, delay);
}

async function tick(): Promise<void> {
  if (isTickRunning) {
    return;
  }
  isTickRunning = true;
  try {
    await runDueRRuleTasks();
    await scheduleNextWake();
  } finally {
    isTickRunning = false;
  }
}

export async function rescheduleRRuleTasks(): Promise<void> {
  await runDueRRuleTasks();
  await scheduleNextWake();
}

export function shutdownRRuleTaskScheduler(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
