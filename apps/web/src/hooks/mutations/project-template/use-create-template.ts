import { useMutation, useQueryClient } from "@tanstack/react-query";
import createTemplate from "@/fetchers/project-template/create-template";
import { toast } from "@/lib/toast";

export function useCreateTemplate(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-templates", workspaceId],
      });
      toast.success("Template created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create template",
      );
    },
  });
}
