import type { QueryClient } from "@tanstack/react-query";

export function invalidateRruleTasks(
  queryClient: QueryClient,
  workspaceId?: string,
) {
  return queryClient.invalidateQueries({
    queryKey: workspaceId ? ["rrule-tasks", workspaceId] : ["rrule-tasks"],
    refetchType: "all",
  });
}
