import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import RruleTaskListView from "@/components/rrule-task/rrule-task-list-view";
import RruleTaskSheet from "@/components/rrule-task/rrule-task-sheet";
import { useRruleTasksByWorkspace } from "@/hooks/queries/rrule-task/use-rrule-tasks-by-workspace";
import type { ProjectWithRruleTasks } from "@/types/rrule-task";

type RruleTasksSearchParams = {
  rruleTaskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/rrule-tasks",
)({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): RruleTasksSearchParams => ({
    rruleTaskId:
      typeof search.rruleTaskId === "string" ? search.rruleTaskId : undefined,
  }),
});

function RouteComponent() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const { rruleTaskId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } =
    useRruleTasksByWorkspace(workspaceId);

  const handleTaskClick = useCallback(
    (taskId: string) => {
      navigate({
        to: ".",
        search: { rruleTaskId: taskId },
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
      <PageTitle title={t("rruleTask:pageTitle")} />
      <WorkspaceLayout title={t("rruleTask:pageTitle")}>
        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">
            {t("common:empty.loading")}
          </div>
        ) : (
          <RruleTaskListView
            projects={projects as ProjectWithRruleTasks[]}
            workspaceId={workspaceId}
            onTaskClick={handleTaskClick}
          />
        )}
      </WorkspaceLayout>

      <RruleTaskSheet
        taskId={rruleTaskId}
        workspaceId={workspaceId}
        onClose={handleCloseTaskSheet}
      />
    </>
  );
}
