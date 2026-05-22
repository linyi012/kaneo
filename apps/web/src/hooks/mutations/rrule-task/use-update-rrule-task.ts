import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateRruleTask from "@/fetchers/rrule-task/update-rrule-task";
import { toast } from "@/lib/toast";

export function useUpdateRruleTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      task,
    }: {
      id: string;
      task: Parameters<typeof updateRruleTask>[1];
    }) => updateRruleTask(id, task),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rrule-tasks", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["rrule-task", variables.id],
      });
      toast.success("RRule task saved");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update RRule task",
      );
    },
  });
}
