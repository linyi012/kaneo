import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import updateTemplateTask from "@/fetchers/project-template/update-template-task";
import { toast } from "@/lib/toast";
import type { ProjectTemplateTask } from "@/types/project-template";

export function useUpdateTemplateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      task,
    }: {
      taskId: string;
      task: Parameters<typeof updateTemplateTask>[1];
    }) => updateTemplateTask(taskId, task),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-templates", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["template-task", variables.taskId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("projectTemplate:toast.taskUpdateFailed"),
      );
    },
  });
}

export type UpdateTemplateTaskPayload = Parameters<
  typeof updateTemplateTask
>[1] &
  Partial<ProjectTemplateTask>;
