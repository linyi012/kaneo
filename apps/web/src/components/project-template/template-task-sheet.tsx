import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTemplateTask } from "@/hooks/mutations/project-template/use-delete-template-task";
import { useUpdateTemplateTask } from "@/hooks/mutations/project-template/use-update-template-task";
import { useTemplateTask } from "@/hooks/queries/project-template/use-template-task";
import { cn } from "@/lib/cn";
import { getPriorityLabel } from "@/lib/i18n/domain";
import { getPriorityIcon } from "@/lib/priority";
import { toast } from "@/lib/toast";
import TemplateDueDaysPopover from "./template-due-days-popover";
import TemplateTaskAssigneePopover from "./template-task-assignee-popover";
import type { TemplateTaskLabel } from "./template-task-label";
import TemplateTaskLabelsEditor from "./template-task-labels-editor";

const TEMPLATE_STATUSES = [
  "to-do",
  "in-progress",
  "in-review",
  "done",
] as const;

const PRIORITIES = ["no-priority", "low", "medium", "high", "urgent"] as const;

type TemplateTaskSheetProps = {
  taskId: string | undefined;
  workspaceId: string;
  onClose: () => void;
};

export default function TemplateTaskSheet({
  taskId,
  workspaceId,
  onClose,
}: TemplateTaskSheetProps) {
  const { t } = useTranslation();
  const { data: task, isLoading } = useTemplateTask(taskId ?? "");
  const { mutateAsync: updateTask, isPending } =
    useUpdateTemplateTask(workspaceId);
  const { mutateAsync: deleteTask } = useDeleteTemplateTask(workspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("to-do");
  const [priority, setPriority] = useState("no-priority");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDaysOffset, setDueDaysOffset] = useState<number | null>(null);
  const [labels, setLabels] = useState<TemplateTaskLabel[]>([]);

  const priorityOptions = useMemo(
    () =>
      PRIORITIES.map((value) => ({
        value,
        label: getPriorityLabel(value),
      })),
    [],
  );

  const selectedPriority = priorityOptions.find((p) => p.value === priority);
  const statusLabel = t(`tasks:status.${status}`, { defaultValue: status });

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority ?? "no-priority");
    setAssigneeId(task.userId ?? "");
    setDueDaysOffset(task.dueDaysOffset ?? null);
    setLabels(
      task.labels?.map((l) => ({ name: l.name, color: l.color })) ?? [],
    );
  }, [task]);

  const handleSave = async () => {
    if (!taskId || !task) return;
    try {
      await updateTask({
        taskId,
        task: {
          title,
          description,
          status,
          priority,
          userId: assigneeId || null,
          startDate: task.startDate,
          dueDaysOffset,
          position: task.position ?? 0,
          labels: labels.map((l) => ({ name: l.name, color: l.color })),
        },
      });
      toast.success(t("projectTemplate:task.saved"));
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
      <SheetPopup
        side="right"
        className="max-w-2xl w-full sm:w-[calc(100%-(--spacing(12)))]"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-border py-4">
          <SheetTitle className="text-sm font-medium">
            {t("projectTemplate:task.editTitle")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("projectTemplate:task.editTitle")}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !task ? (
          <SheetPanel>
            <p className="text-sm text-muted-foreground">
              {t("tasks:common.loadingTask")}
            </p>
          </SheetPanel>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <SheetPanel className="flex flex-col gap-6">
              <Input
                unstyled
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("common:modals.createTask.taskTitlePlaceholder")}
                className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-1 [&_[data-slot=input]]:text-2xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:tracking-tight [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
                required
              />

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "common:modals.createTask.descriptionPlaceholder",
                )}
                rows={4}
                className="min-h-[100px] resize-y"
              />

              <Field>
                <FieldLabel>{t("common:modals.createTask.labels")}</FieldLabel>
                <TemplateTaskLabelsEditor
                  workspaceId={workspaceId}
                  labels={labels}
                  onChange={setLabels}
                />
              </Field>

              <div className="flex flex-wrap items-center gap-2 py-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md border border-border bg-accent/50 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                      {statusLabel}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    {TEMPLATE_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="flex h-8 w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent/50"
                        onClick={() => setStatus(s)}
                      >
                        <span>
                          {t(`tasks:status.${s}`, { defaultValue: s })}
                        </span>
                        {status === s && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent/50",
                        priority !== "no-priority"
                          ? "bg-accent/30 text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {getPriorityIcon(priority)}
                      <span>
                        {selectedPriority?.label ??
                          t("common:modals.createTask.priority")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    <div className="space-y-1">
                      {priorityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="flex h-8 w-full items-center gap-2 px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50"
                          onClick={() => setPriority(option.value)}
                        >
                          {getPriorityIcon(option.value)}
                          <span className="text-sm">{option.label}</span>
                          {priority === option.value && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

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
            </SheetPanel>

            <SheetFooter className="flex-row items-center justify-between border-t border-border bg-background sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleDelete()}
              >
                {t("tasks:delete.action")}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  {t("common:actions.cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !title.trim()}
                >
                  {t("projectTemplate:actions.save")}
                </Button>
              </div>
            </SheetFooter>
          </form>
        )}
      </SheetPopup>
    </Sheet>
  );
}
