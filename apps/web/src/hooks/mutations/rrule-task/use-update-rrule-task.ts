import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
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
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("rruleTask:toast.taskUpdateFailed"),
      );
    },
  });
}
