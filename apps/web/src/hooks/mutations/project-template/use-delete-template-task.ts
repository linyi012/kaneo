import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      toast.success("Template task deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete template task",
      );
    },
  });
}
