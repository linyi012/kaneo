import { useQuery } from "@tanstack/react-query";
import getTemplateTask from "@/fetchers/project-template/get-template-task";

export function useTemplateTask(taskId: string) {
  return useQuery({
    queryKey: ["template-task", taskId],
    queryFn: () => getTemplateTask(taskId),
    enabled: Boolean(taskId),
  });
}
