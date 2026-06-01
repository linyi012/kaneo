import { useMutation, useQueryClient } from "@tanstack/react-query";
import createProjectFromTemplate from "@/fetchers/project-template/create-project-from-template";
import { invalidateRruleTasks } from "@/lib/invalidate-rrule-tasks";
import { toast } from "@/lib/toast";

export function useCreateProjectFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectFromTemplate,
    onSuccess: (_data, variables) => {
      void invalidateRruleTasks(queryClient, variables.workspaceId);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create project from template",
      );
    },
  });
}
