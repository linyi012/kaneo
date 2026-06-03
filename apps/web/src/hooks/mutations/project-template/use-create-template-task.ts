import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import createTemplateTask from "@/fetchers/project-template/create-template-task";
import { toast } from "@/lib/toast";

export function useCreateTemplateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-templates", workspaceId],
      });
      toast.success(i18n.t("projectTemplate:toast.taskCreated"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("projectTemplate:toast.taskCreateFailed"),
      );
    },
  });
}
