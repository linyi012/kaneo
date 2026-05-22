import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TemplateDueDaysPopover from "@/components/project-template/template-due-days-popover";
import TemplateTaskAssigneePopover from "@/components/project-template/template-task-assignee-popover";
import type { TemplateTaskLabel } from "@/components/project-template/template-task-label";
import TemplateTaskLabelsEditor from "@/components/project-template/template-task-labels-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRruleTask } from "@/hooks/mutations/rrule-task/use-create-rrule-task";
import { cn } from "@/lib/cn";
import { getPriorityLabel } from "@/lib/i18n/domain";
import { getPriorityIcon } from "@/lib/priority";
import { DEFAULT_RRULE } from "./constants";
import RRuleBuilder from "./rrule-builder";

const PRIORITIES = ["no-priority", "low", "medium", "high", "urgent"] as const;

type Priority = (typeof PRIORITIES)[number];

type CreateRruleTaskModalProps = {
  open: boolean;
  projectId: string;
  workspaceId: string;
  onClose: () => void;
};

export default function CreateRruleTaskModal({
  open,
  projectId,
  workspaceId,
  onClose,
}: CreateRruleTaskModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("to-do");
  const [priority, setPriority] = useState<Priority>("no-priority");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDaysOffset, setDueDaysOffset] = useState<number | null>(null);
  const [rrule, setRrule] = useState(DEFAULT_RRULE);
  const [labels, setLabels] = useState<TemplateTaskLabel[]>([]);

  const { mutateAsync: createTask, isPending } =
    useCreateRruleTask(workspaceId);

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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("to-do");
    setPriority("no-priority");
    setAssigneeId("");
    setDueDaysOffset(null);
    setRrule(DEFAULT_RRULE);
    setLabels([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rrule.trim()) return;
    await createTask({
      projectId,
      title: title.trim(),
      description,
      status,
      priority,
      userId: assigneeId || undefined,
      dueDaysOffset,
      rrule: rrule.trim(),
      labels: labels.map((l) => ({ name: l.name, color: l.color })),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="kaneo-create-task-modal max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-sm font-medium">
            {t("rruleTask:createTask.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("rruleTask:createTask.title")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col flex-1 min-h-0 space-y-6"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
            <Input
              unstyled
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder={t("common:modals.createTask.taskTitlePlaceholder")}
              className="w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:py-3 [&_[data-slot=input]]:text-2xl [&_[data-slot=input]]:leading-tight [&_[data-slot=input]]:font-semibold [&_[data-slot=input]]:tracking-tight [&_[data-slot=input]]:text-foreground [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:outline-none"
              required
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("common:modals.createTask.descriptionPlaceholder")}
              rows={4}
              className="min-h-[100px] resize-y"
            />

            <RRuleBuilder value={rrule} onRruleChange={setRrule} />

            <TemplateTaskLabelsEditor
              workspaceId={workspaceId}
              labels={labels}
              onChange={setLabels}
            />

            <div className="flex flex-wrap items-center gap-2 py-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/50 text-foreground rounded-md text-xs font-medium border border-border hover:bg-accent/60"
                  >
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                    {statusLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  {(["to-do", "in-progress", "in-review", "done"] as const).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left h-8"
                        onClick={() => setStatus(s)}
                      >
                        <span>
                          {t(`tasks:status.${s}`, { defaultValue: s })}
                        </span>
                        {status === s && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    ),
                  )}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
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
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
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
          </div>

          <DialogFooter className="flex-shrink-0 border-t border-border bg-background px-6 py-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              size="sm"
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !rrule.trim()}
              size="sm"
            >
              {t("rruleTask:actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
