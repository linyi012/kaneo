import { useMutation, useQueryClient } from "@tanstack/react-query";
import createProjectFromTemplate from "@/fetchers/project-template/create-project-from-template";
import { invalidateRruleTasks } from "@/lib/invalidate-rrule-tasks";

export function useCreateProjectFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectFromTemplate,
    onSuccess: (_data, variables) => {
      void invalidateRruleTasks(queryClient, variables.workspaceId);
    },
  });
}
