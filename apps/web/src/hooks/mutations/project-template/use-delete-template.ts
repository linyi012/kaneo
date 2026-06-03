import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import deleteTemplate from "@/fetchers/project-template/delete-template";
import { toast } from "@/lib/toast";

export function useDeleteTemplate(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-templates", workspaceId],
      });
      toast.success(i18n.t("projectTemplate:toast.templateDeleted"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("projectTemplate:toast.templateDeleteFailed"),
      );
    },
  });
}
