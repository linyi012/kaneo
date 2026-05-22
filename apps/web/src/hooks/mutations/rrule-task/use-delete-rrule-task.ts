import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteRruleTask from "@/fetchers/rrule-task/delete-rrule-task";
import { toast } from "@/lib/toast";

export function useDeleteRruleTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRruleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rrule-tasks", workspaceId],
      });
      toast.success("RRule task deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete RRule task",
      );
    },
  });
}
