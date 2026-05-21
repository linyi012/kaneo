import { useQuery } from "@tanstack/react-query";
import getTemplatesByWorkspace from "@/fetchers/project-template/get-templates-by-workspace";

export function useProjectTemplates(workspaceId: string) {
  return useQuery({
    queryKey: ["project-templates", workspaceId],
    queryFn: () => getTemplatesByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
