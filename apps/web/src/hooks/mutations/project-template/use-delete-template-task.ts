import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import deleteTemplateTask from "@/fetchers/project-template/delete-template-task";
import { toast } from "@/lib/toast";

export function useDeleteTemplateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-templates", workspaceId],
      });
      toast.success(i18n.t("projectTemplate:toast.taskDeleted"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("projectTemplate:toast.taskDeleteFailed"),
      );
    },
  });
}
