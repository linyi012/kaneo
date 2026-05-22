import { ChevronRight, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { ProjectWithRruleTasks } from "@/types/rrule-task";
import CreateRruleTaskModal from "./create-rrule-task-modal";
import RruleTaskRow from "./rrule-task-row";

type RruleTaskListViewProps = {
  projects: ProjectWithRruleTasks[];
  workspaceId: string;
  onTaskClick: (taskId: string) => void;
};

export default function RruleTaskListView({
  projects,
  workspaceId,
  onTaskClick,
}: RruleTaskListViewProps) {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => {
    const sections: Record<string, boolean> = {};
    for (const project of projects) {
      sections[project.id] = true;
    }
    return sections;
  });
  const [taskModalProjectId, setTaskModalProjectId] = useState<string | null>(
    null,
  );

  const toggleSection = (projectId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  if (projects.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-sm text-muted-foreground">
        <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p>{t("rruleTask:emptyProjects")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full overflow-auto bg-muted/20">
        <div className="divide-y divide-border/50">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border-b border-border/50 transition-all duration-200 overflow-auto"
            >
              <div className="flex items-center justify-between py-2 px-4 bg-muted/60 border-b border-border/50">
                <button
                  type="button"
                  onClick={() => toggleSection(project.id)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "w-3 h-3 transition-transform",
                      expandedSections[project.id] && "rotate-90",
                    )}
                  />
                  <div className="flex items-center gap-2 h-4">
                    <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="mt-1 mr-1">{project.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {project.rruleTasks.length}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskModalProjectId(project.id)}
                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                  title={t("rruleTask:addTask")}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {expandedSections[project.id] && (
                <div className="bg-card">
                  {project.rruleTasks.map((task) => (
                    <RruleTaskRow
                      key={task.id}
                      task={task}
                      projectSlug={project.slug}
                      workspaceId={workspaceId}
                      onClick={() => onTaskClick(task.id)}
                    />
                  ))}
                  {project.rruleTasks.length === 0 && (
                    <div className="py-6 px-4 text-center text-xs text-muted-foreground">
                      {t("rruleTask:noTasksInProject")}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {taskModalProjectId && (
        <CreateRruleTaskModal
          open={Boolean(taskModalProjectId)}
          projectId={taskModalProjectId}
          workspaceId={workspaceId}
          onClose={() => setTaskModalProjectId(null)}
        />
      )}
    </>
  );
}
