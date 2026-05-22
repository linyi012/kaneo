import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TemplateDueDaysPopover from "@/components/project-template/template-due-days-popover";
import TemplateTaskAssigneePopover from "@/components/project-template/template-task-assignee-popover";
import type { TemplateTaskLabel } from "@/components/project-template/template-task-label";
import TemplateTaskLabelsEditor from "@/components/project-template/template-task-labels-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteRruleTask } from "@/hooks/mutations/rrule-task/use-delete-rrule-task";
import { useUpdateRruleTask } from "@/hooks/mutations/rrule-task/use-update-rrule-task";
import { useRruleTask } from "@/hooks/queries/rrule-task/use-rrule-task";
import { getPriorityLabel } from "@/lib/i18n/domain";
import { getPriorityIcon } from "@/lib/priority";
import { toast } from "@/lib/toast";

const TEMPLATE_STATUSES = [
  "to-do",
  "in-progress",
  "in-review",
  "done",
] as const;

const PRIORITIES = ["no-priority", "low", "medium", "high", "urgent"] as const;

type RruleTaskSheetProps = {
  taskId: string | undefined;
  workspaceId: string;
  onClose: () => void;
};

export default function RruleTaskSheet({
  taskId,
  workspaceId,
  onClose,
}: RruleTaskSheetProps) {
  const { t } = useTranslation();
  const { data: task, isLoading } = useRruleTask(taskId ?? "");
  const { mutateAsync: updateTask, isPending } =
    useUpdateRruleTask(workspaceId);
  const { mutateAsync: deleteTask } = useDeleteRruleTask(workspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("to-do");
  const [priority, setPriority] = useState("no-priority");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDaysOffset, setDueDaysOffset] = useState<number | null>(null);
  const [rrule, setRrule] = useState("");
  const [labels, setLabels] = useState<TemplateTaskLabel[]>([]);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority ?? "no-priority");
    setAssigneeId(task.userId ?? "");
    setDueDaysOffset(task.dueDaysOffset ?? null);
    setRrule(task.rrule);
    setLabels(
      task.labels?.map((l) => ({ name: l.name, color: l.color })) ?? [],
    );
  }, [task]);

  const handleSave = async () => {
    if (!taskId || !task) return;
    try {
      await updateTask({
        id: taskId,
        task: {
          title,
          description,
          status,
          priority,
          userId: assigneeId || null,
          startDate: task.startDate,
          dueDaysOffset,
          rrule: rrule.trim(),
          position: task.position ?? 0,
          labels: labels.map((l) => ({ name: l.name, color: l.color })),
        },
      });
      toast.success(t("rruleTask:task.saved"));
      onClose();
    } catch {
      // toast handled in mutation
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
      onClose();
    } catch {
      // toast handled in mutation
    }
  };

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full max-w-full sm:max-w-lg md:max-w-2xl p-0 gap-0 [&>button]:hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
          <span className="text-sm font-medium text-muted-foreground">
            {t("rruleTask:task.editTitle")}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 gap-4">
          {isLoading || !task ? (
            <p className="text-sm text-muted-foreground">
              {t("tasks:common.loadingTask")}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="rrule-task-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("rruleTask:task.title")}
                </Label>
                <Input
                  id="rrule-task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="rrule-task-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("rruleTask:task.description")}
                </Label>
                <Textarea
                  id="rrule-task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="rrule-task-rrule"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("rruleTask:rrule.label")}
                </Label>
                <Textarea
                  id="rrule-task-rrule"
                  value={rrule}
                  onChange={(e) => setRrule(e.target.value)}
                  placeholder={t("rruleTask:rrule.placeholder")}
                  rows={4}
                  className="font-mono text-xs min-h-[80px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("rruleTask:task.properties")}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {t("rruleTask:task.status")}
                    </span>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`tasks:status.${s}`, { defaultValue: s })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {t("rruleTask:task.priority")}
                    </span>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            {getPriorityIcon(priority)}
                            {getPriorityLabel(priority)}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            <span className="flex items-center gap-2">
                              {getPriorityIcon(p)}
                              {getPriorityLabel(p)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <TemplateTaskAssigneePopover
                    workspaceId={workspaceId}
                    assigneeId={assigneeId}
                    onChange={setAssigneeId}
                  />
                  <TemplateDueDaysPopover
                    dueDaysOffset={dueDaysOffset}
                    onChange={setDueDaysOffset}
                  />
                </div>
                {task.nextRunAt && (
                  <p className="text-[10px] text-muted-foreground pt-1">
                    {t("rruleTask:task.nextRunAt", {
                      date: new Date(task.nextRunAt).toLocaleString(),
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("common:modals.createTask.labels")}
                </Label>
                <TemplateTaskLabelsEditor
                  workspaceId={workspaceId}
                  labels={labels}
                  onChange={setLabels}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete()}
                >
                  {t("tasks:delete.action")}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    {t("common:actions.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleSave()}
                    disabled={isPending || !title.trim() || !rrule.trim()}
                  >
                    {t("rruleTask:actions.save")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
