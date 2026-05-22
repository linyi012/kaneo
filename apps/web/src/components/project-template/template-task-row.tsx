import { CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetActiveWorkspaceUsers } from "@/hooks/queries/workspace-users/use-get-active-workspace-users";
import { cn } from "@/lib/cn";
import { getPriorityIcon } from "@/lib/priority";
import { useUserPreferencesStore } from "@/store/user-preferences";
import type { ProjectTemplateTask } from "@/types/project-template";

type TemplateTaskRowProps = {
  task: ProjectTemplateTask;
  templateName: string;
  workspaceId: string;
  onClick: () => void;
};

export default function TemplateTaskRow({
  task,
  templateName,
  workspaceId,
  onClick,
}: TemplateTaskRowProps) {
  const { t } = useTranslation();
  const {
    showAssignees,
    showPriority,
    showDueDates,
    showLabels,
    showTaskNumbers,
  } = useUserPreferencesStore();

  const { data: workspaceUsers } = useGetActiveWorkspaceUsers(workspaceId);

  const assignee = useMemo(() => {
    return workspaceUsers?.members?.find(
      (member) => member.userId === task.userId,
    );
  }, [workspaceUsers, task.userId]);

  const labelItems =
    task.labels?.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })) ?? [];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-3 px-4 py-1.5 text-left transition-colors cursor-pointer border-b border-border/50 hover:bg-accent/60",
      )}
    >
      {showPriority && (
        <div className="flex-shrink-0 first:[&_svg]:h-4 first:[&_svg]:w-4">
          {getPriorityIcon(task.priority ?? "")}
        </div>
      )}
      {showTaskNumbers && (
        <div className="text-xs font-mono text-muted-foreground flex-shrink-0">
          {templateName}-{task.number}
        </div>
      )}

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm text-foreground truncate">{task.title}</span>
        {showLabels && labelItems.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {labelItems.map((label) => (
              <span
                key={label.id}
                className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-sidebar text-muted-foreground"
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {showDueDates &&
        task.dueDaysOffset !== null &&
        task.dueDaysOffset !== undefined && (
          <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded flex-shrink-0 bg-muted/50 text-muted-foreground">
            <CalendarClock className="w-3 h-3" />
            <span>
              {t("projectTemplate:dueDays.afterProject", {
                count: task.dueDaysOffset,
              })}
            </span>
          </div>
        )}

      {showAssignees && (
        <div className="flex-shrink-0">
          {task.userId ? (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={assignee?.user?.image ?? ""}
                alt={assignee?.user?.name || ""}
              />
              <AvatarFallback className="text-xs font-medium border border-border/30">
                {assignee?.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center"
              title={t("tasks:assignee.unassigned")}
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                ?
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
