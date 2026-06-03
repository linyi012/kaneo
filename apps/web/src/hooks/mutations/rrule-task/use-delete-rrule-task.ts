import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
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
      toast.success(i18n.t("rruleTask:toast.taskDeleted"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("rruleTask:toast.taskDeleteFailed"),
      );
    },
  });
}
