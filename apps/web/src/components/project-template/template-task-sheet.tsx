import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useDeleteTemplateTask } from "@/hooks/mutations/project-template/use-delete-template-task";
import { useUpdateTemplateTask } from "@/hooks/mutations/project-template/use-update-template-task";
import { useTemplateTask } from "@/hooks/queries/project-template/use-template-task";
import { getPriorityLabel } from "@/lib/i18n/domain";
import { getPriorityIcon } from "@/lib/priority";
import { toast } from "@/lib/toast";

const TEMPLATE_STATUSES = [
  { slug: "to-do", labelKey: "toDo" },
  { slug: "in-progress", labelKey: "inProgress" },
  { slug: "in-review", labelKey: "inReview" },
  { slug: "done", labelKey: "done" },
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

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority ?? "no-priority");
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
          userId: task.userId,
          startDate: task.startDate,
          dueDate: task.dueDate,
          position: task.position ?? 0,
          labels: task.labels?.map((l) => ({
            name: l.name,
            color: l.color,
          })),
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
      <SheetContent
        side="right"
        className="w-full max-w-full sm:max-w-lg md:max-w-2xl p-0 gap-0 [&>button]:hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
          <span className="text-sm font-medium text-muted-foreground">
            {t("projectTemplate:task.editTitle")}
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
                  htmlFor="template-task-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("projectTemplate:task.title")}
                </Label>
                <Input
                  id="template-task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="template-task-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("projectTemplate:task.description")}
                </Label>
                <Textarea
                  id="template-task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("projectTemplate:task.status")}
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_STATUSES.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("projectTemplate:task.priority")}
                  </Label>
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
                    disabled={isPending || !title.trim()}
                  >
                    {t("projectTemplate:actions.save")}
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
