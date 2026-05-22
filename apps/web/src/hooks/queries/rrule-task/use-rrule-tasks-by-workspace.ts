import { useQuery } from "@tanstack/react-query";
import getRruleTasksByWorkspace from "@/fetchers/rrule-task/get-rrule-tasks-by-workspace";

export function useRruleTasksByWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["rrule-tasks", workspaceId],
    queryFn: () => getRruleTasksByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
