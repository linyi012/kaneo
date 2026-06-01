import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateProject from "@/fetchers/project/update-project";
import { invalidateRruleTasks } from "@/lib/invalidate-rrule-tasks";

function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      void invalidateRruleTasks(queryClient);
    },
  });
}

export default useUpdateProject;
