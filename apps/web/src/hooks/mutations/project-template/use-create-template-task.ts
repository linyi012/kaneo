import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      toast.success("Template task created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create template task",
      );
    },
  });
}
