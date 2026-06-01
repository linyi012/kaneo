import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteProject from "@/fetchers/project/delete-project";
import { invalidateRruleTasks } from "@/lib/invalidate-rrule-tasks";

function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      void invalidateRruleTasks(queryClient);
    },
  });
}

export default useDeleteProject;
