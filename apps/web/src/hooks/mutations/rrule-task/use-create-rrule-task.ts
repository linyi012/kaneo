import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
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
      toast.success(i18n.t("rruleTask:toast.taskCreated"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("rruleTask:toast.taskCreateFailed"),
      );
    },
  });
}
