import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";

const QUICK_OFFSETS = [1, 3, 7, 14, 30] as const;

type TemplateDueDaysPopoverProps = {
  dueDaysOffset: number | null;
  onChange: (offset: number | null) => void;
};

export default function TemplateDueDaysPopover({
  dueDaysOffset,
  onChange,
}: TemplateDueDaysPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setDraft(
        dueDaysOffset !== null && dueDaysOffset !== undefined
          ? String(dueDaysOffset)
          : "",
      );
    }
  };

  const applyDraft = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      onChange(null);
      setOpen(false);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed < 0) return;
    onChange(parsed);
    setOpen(false);
  };

  const label =
    dueDaysOffset !== null && dueDaysOffset !== undefined
      ? t("projectTemplate:dueDays.afterProject", { count: dueDaysOffset })
      : t("projectTemplate:dueDays.label");

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
            dueDaysOffset !== null && dueDaysOffset !== undefined
              ? "bg-accent/30 text-foreground"
              : "text-muted-foreground",
          )}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3" align="start">
        <p className="text-xs text-muted-foreground">
          {t("projectTemplate:dueDays.hint")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_OFFSETS.map((days) => (
            <Button
              key={days}
              type="button"
              variant={dueDaysOffset === days ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                onChange(days);
                setOpen(false);
              }}
            >
              {t("projectTemplate:dueDays.quick", { count: days })}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="0"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyDraft();
              }
            }}
          />
          <span className="text-xs text-muted-foreground shrink-0">
            {t("projectTemplate:dueDays.daysUnit")}
          </span>
        </div>
        <div className="flex gap-2">
          {dueDaysOffset !== null && dueDaysOffset !== undefined && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {t("projectTemplate:dueDays.clear")}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="flex-1 text-xs"
            onClick={applyDraft}
          >
            {t("projectTemplate:dueDays.apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
