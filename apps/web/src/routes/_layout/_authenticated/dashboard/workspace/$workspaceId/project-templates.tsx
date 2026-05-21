import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileStack } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CreateTemplateModal from "@/components/project-template/create-template-modal";
import ProjectTemplateListView from "@/components/project-template/project-template-list-view";
import TemplateTaskSheet from "@/components/project-template/template-task-sheet";
import { Button } from "@/components/ui/button";
import { useProjectTemplates } from "@/hooks/queries/project-template/use-project-templates";

type ProjectTemplatesSearchParams = {
  templateTaskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project-templates",
)({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): ProjectTemplatesSearchParams => ({
    templateTaskId:
      typeof search.templateTaskId === "string"
        ? search.templateTaskId
        : undefined,
  }),
});

function RouteComponent() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const { templateTaskId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useProjectTemplates(workspaceId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleTaskClick = useCallback(
    (taskId: string) => {
      navigate({
        to: ".",
        search: { templateTaskId: taskId },
      });
    },
    [navigate],
  );

  const handleCloseTaskSheet = useCallback(() => {
    navigate({
      to: ".",
      search: {},
      replace: true,
    });
  }, [navigate]);

  return (
    <>
      <PageTitle title={t("projectTemplate:pageTitle")} />
      <WorkspaceLayout
        title={t("projectTemplate:pageTitle")}
        headerActions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            size="xs"
            className="gap-1 w-full md:w-auto"
          >
            <FileStack className="w-3 h-3" />
            {t("projectTemplate:createTemplate.button")}
          </Button>
        }
      >
        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">
            {t("common:empty.loading")}
          </div>
        ) : (
          <ProjectTemplateListView
            templates={templates}
            workspaceId={workspaceId}
            onTaskClick={handleTaskClick}
          />
        )}
      </WorkspaceLayout>

      <CreateTemplateModal
        open={isCreateModalOpen}
        workspaceId={workspaceId}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <TemplateTaskSheet
        taskId={templateTaskId}
        workspaceId={workspaceId}
        onClose={handleCloseTaskSheet}
      />
    </>
  );
}
