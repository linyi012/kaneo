import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
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
      toast.success(i18n.t("projectTemplate:toast.templateCreated"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : i18n.t("projectTemplate:toast.templateCreateFailed"),
      );
    },
  });
}
