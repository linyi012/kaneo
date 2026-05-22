import { client } from "@kaneo/libs";
import type { ProjectTemplateTask } from "@/types/project-template";

async function updateTemplateTask(
  taskId: string,
  task: Pick<
    ProjectTemplateTask,
    | "title"
    | "description"
    | "status"
    | "priority"
    | "userId"
    | "startDate"
    | "dueDaysOffset"
    | "position"
  > & { labels?: { name: string; color: string }[] },
) {
  const response = await client["project-template"].tasks[":taskId"].$patch({
    param: { taskId },
    json: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority ?? "no-priority",
      userId: task.userId,
      startDate: task.startDate,
      dueDaysOffset: task.dueDaysOffset,
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

export default updateTemplateTask;
