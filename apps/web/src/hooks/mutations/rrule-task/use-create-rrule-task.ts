import { useMutation, useQueryClient } from "@tanstack/react-query";
import createRruleTask from "@/fetchers/rrule-task/create-rrule-task";
import { toast } from "@/lib/toast";

export function useCreateRruleTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRruleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rrule-tasks", workspaceId],
      });
      toast.success("RRule task created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create RRule task",
      );
    },
  });
}
