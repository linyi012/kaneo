import { client } from "@kaneo/libs";
import type { RruleTask } from "@/types/rrule-task";

async function updateRruleTask(
  id: string,
  task: Pick<
    RruleTask,
    | "title"
    | "description"
    | "status"
    | "priority"
    | "userId"
    | "startDate"
    | "dueDaysOffset"
    | "rrule"
    | "position"
  > & { labels?: { name: string; color: string }[] },
) {
  const response = await client["rrule-task"][":id"].$patch({
    param: { id },
    json: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority ?? "no-priority",
      userId: task.userId,
      startDate: task.startDate,
      dueDaysOffset: task.dueDaysOffset,
      rrule: task.rrule,
      position: task.position ?? 0,
      labels: task.labels,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default updateRruleTask;
