import { Check, Plus, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import labelColors from "@/constants/label-colors";
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";
import { cn } from "@/lib/cn";
import type { TemplateTaskLabel } from "./template-task-label";

type LabelColor =
  | "gray"
  | "dark-gray"
  | "purple"
  | "teal"
  | "green"
  | "yellow"
  | "orange"
  | "pink"
  | "red";

type PopoverStep = "select" | "color";

type TemplateTaskLabelsEditorProps = {
  workspaceId: string;
  labels: TemplateTaskLabel[];
  onChange: (labels: TemplateTaskLabel[]) => void;
  showBadges?: boolean;
};

export default function TemplateTaskLabelsEditor({
  workspaceId,
  labels,
  onChange,
  showBadges = true,
}: TemplateTaskLabelsEditorProps) {
  const { t } = useTranslation();
  const { data: workspaceLabels = [] } = useGetLabelsByWorkspace(workspaceId);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [labelsStep, setLabelsStep] = useState<PopoverStep>("select");
  const [searchValue, setSearchValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<LabelColor>("gray");
  const [newLabelName, setNewLabelName] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const labelColorOptions = useMemo(
    () =>
      [
        { value: "gray" as LabelColor, labelKey: "stone" as const },
        { value: "dark-gray" as LabelColor, labelKey: "slate" as const },
        { value: "purple" as LabelColor, labelKey: "lavender" as const },
        { value: "teal" as LabelColor, labelKey: "sage" as const },
        { value: "green" as LabelColor, labelKey: "forest" as const },
        { value: "yellow" as LabelColor, labelKey: "amber" as const },
        { value: "orange" as LabelColor, labelKey: "terracotta" as const },
        { value: "pink" as LabelColor, labelKey: "rose" as const },
        { value: "red" as LabelColor, labelKey: "crimson" as const },
      ].map(({ labelKey, ...rest }) => ({
        ...rest,
        label: t(`common:modals.createTask.labelColors.${labelKey}`),
        color:
          labelColors.find((c) => c.value === rest.value)?.color ||
          "var(--color-neutral-400)",
      })),
    [t],
  );

  const filteredLabels = (() => {
    const searchFiltered = workspaceLabels.filter((label) =>
      label.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
    const labelMap = new Map<string, (typeof workspaceLabels)[0]>();
    for (const label of searchFiltered) {
      const existing = labelMap.get(label.name);
      if (!existing || (label.taskId === null && existing.taskId !== null)) {
        labelMap.set(label.name, label);
      }
    }
    return Array.from(labelMap.values());
  })();

  const isCreatingNewLabel =
    searchValue &&
    !workspaceLabels.some(
      (label) => label.name.toLowerCase() === searchValue.toLowerCase(),
    ) &&
    !labels.some((l) => l.name.toLowerCase() === searchValue.toLowerCase());

  useEffect(() => {
    if (labelsOpen && labelsStep === "select" && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [labelsOpen, labelsStep]);

  const resetLabelsPopover = () => {
    setLabelsStep("select");
    setSearchValue("");
    setNewLabelName("");
    setSelectedColor("gray");
  };

  const handleLabelsClose = () => {
    setLabelsOpen(false);
    setTimeout(resetLabelsPopover, 200);
  };

  const toggleLabel = (labelName: string, color: string) => {
    if (labels.some((l) => l.name === labelName)) {
      onChange(labels.filter((l) => l.name !== labelName));
    } else {
      onChange([...labels, { name: labelName, color }]);
    }
  };

  const removeLabel = (labelName: string) => {
    onChange(labels.filter((l) => l.name !== labelName));
  };

  const handleCreateNewClick = () => {
    setNewLabelName(searchValue);
    setLabelsStep("color");
  };

  const handleColorSelect = (color: LabelColor) => {
    const name = newLabelName.trim();
    if (!name) return;
    if (!labels.some((l) => l.name === name)) {
      onChange([...labels, { name, color }]);
    }
    handleLabelsClose();
  };

  return (
    <div className="space-y-2">
      {showBadges && labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {labels.map((label) => (
            <Badge
              key={label.name}
              color={label.color}
              variant="outline"
              className="flex items-center gap-1 pl-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => removeLabel(label.name)}
            >
              <span
                className="inline-block w-2 h-2 mr-1.5 rounded-full"
                style={{
                  backgroundColor:
                    labelColors.find((c) => c.value === label.color)?.color ||
                    "var(--color-neutral-400)",
                }}
              />
              <span className="max-w-20 truncate">{label.name}</span>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
              labels.length > 0
                ? "bg-accent/30 text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t("common:modals.createTask.labels")}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          {labelsStep === "select" && (
            <div className="w-auto">
              <div className="flex items-center gap-2 p-2 border-b border-border">
                <Search className="w-3 h-3 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t("common:modals.createTask.searchLabels")}
                  className="w-full bg-transparent border-none text-foreground text-xs focus:outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="py-1">
                {filteredLabels.length === 0 && searchValue.length === 0 && (
                  <span className="text-xs text-muted-foreground px-2">
                    {t("common:modals.createTask.noLabelsFound")}
                  </span>
                )}
                {filteredLabels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                    onClick={() => toggleLabel(label.name, label.color)}
                  >
                    <div className="flex-shrink-0 w-3 flex justify-center">
                      {labels.some((l) => l.name === label.name) && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          labelColors.find((c) => c.value === label.color)
                            ?.color || "var(--color-neutral-400)",
                      }}
                    />
                    <span className="max-w-20 truncate">{label.name}</span>
                  </button>
                ))}
                {isCreatingNewLabel && filteredLabels.length > 0 && (
                  <div className="border-t border-border my-1" />
                )}
                {isCreatingNewLabel && (
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
                    onClick={handleCreateNewClick}
                  >
                    <div className="flex-shrink-0 w-3 flex justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          labelColors.find((c) => c.value === selectedColor)
                            ?.color || "var(--color-neutral-400)",
                      }}
                    />
                    <span className="truncate">
                      {t("common:modals.createTask.createLabel", {
                        name: searchValue,
                      })}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
          {labelsStep === "color" && (
            <div className="w-auto">
              <div className="flex items-center justify-between p-2 border-b border-border">
                <span className="text-xs font-medium">
                  {t("common:modals.createTask.chooseColor")}
                </span>
                <button
                  type="button"
                  onClick={() => setLabelsStep("select")}
                  className="w-4 h-4 flex items-center justify-center hover:bg-accent/50 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="py-1">
                {labelColorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left",
                      selectedColor === color.value && "bg-accent/30",
                    )}
                    onClick={() => handleColorSelect(color.value)}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="truncate">{color.label}</span>
                    {selectedColor === color.value && (
                      <Check className="w-3 h-3 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
