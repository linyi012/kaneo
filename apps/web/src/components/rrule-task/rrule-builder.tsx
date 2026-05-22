import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import {
  buildRruleString,
  defaultBuilderState,
  frequencyToLabel,
  labelToFrequency,
  parseRruleString,
  type RruleBuilderState,
  type RruleFrequency,
} from "./rrule-builder-utils";

type RRuleBuilderProps = {
  value: string;
  onRruleChange: (rrule: string) => void;
  className?: string;
};

const WEEKDAY_FIELDS: {
  key: keyof RruleBuilderState["weekdays"];
  label: string;
}[] = [
  { key: "monday", label: "周一" },
  { key: "tuesday", label: "周二" },
  { key: "wednesday", label: "周三" },
  { key: "thursday", label: "周四" },
  { key: "friday", label: "周五" },
  { key: "saturday", label: "周六" },
  { key: "sunday", label: "周日" },
];

export default function RRuleBuilder({
  value,
  onRruleChange,
  className,
}: RRuleBuilderProps) {
  const [state, setState] = useState<RruleBuilderState>(() =>
    value.trim() ? parseRruleString(value) : defaultBuilderState(),
  );
  const onRruleChangeRef = useRef(onRruleChange);
  onRruleChangeRef.current = onRruleChange;
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setState(value.trim() ? parseRruleString(value) : defaultBuilderState());
    lastEmittedRef.current = value;
  }, [value]);

  useEffect(() => {
    const next = buildRruleString(state);
    if (next === lastEmittedRef.current) return;
    lastEmittedRef.current = next;
    onRruleChangeRef.current(next);
  }, [state]);

  const frequencyLabel = frequencyToLabel(state.frequency);

  const patchState = (patch: Partial<RruleBuilderState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const patchWeekday = (
    key: keyof RruleBuilderState["weekdays"],
    checked: boolean,
  ) => {
    setState((prev) => ({
      ...prev,
      weekdays: { ...prev.weekdays, [key]: checked },
    }));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Card className="border-border/60 shadow-none">
        <CardContent className="grid grid-cols-2 gap-3 pt-4">
          <div className="space-y-2">
            <Label htmlFor="rrule-frequency">频率</Label>
            <Select
              value={frequencyLabel}
              onValueChange={(label) => {
                if (!label) return;
                const freq = labelToFrequency(label);
                if (freq) patchState({ frequency: freq });
              }}
            >
              <SelectTrigger id="rrule-frequency" className="h-8 text-xs">
                <SelectValue placeholder="选择频率" />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["daily", "weekly", "monthly", "yearly"] as RruleFrequency[]
                ).map((freq) => (
                  <SelectItem key={freq} value={frequencyToLabel(freq)}>
                    {frequencyToLabel(freq)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rrule-interval">间隔</Label>
            <Input
              id="rrule-interval"
              type="number"
              min={1}
              value={String(state.interval)}
              onChange={(e) =>
                patchState({
                  interval: Number.parseInt(e.target.value, 10) || 1,
                })
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label>开始日期</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex h-8 w-full items-center justify-start rounded-lg border border-input bg-background px-3 text-xs shadow-xs/5",
                )}
              >
                {state.startDate.toLocaleDateString()}
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.startDate}
                  onSelect={(date) => {
                    if (date) patchState({ startDate: date });
                  }}
                  className="w-full bg-popover"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>结束日期</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex h-8 w-full items-center justify-start rounded-lg border border-input bg-background px-3 text-xs shadow-xs/5",
                )}
              >
                {state.endDate
                  ? state.endDate.toLocaleDateString()
                  : "无结束日期"}
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.endDate}
                  onSelect={(date) => patchState({ endDate: date })}
                  className="w-full bg-popover"
                />
                <div className="border-t border-border p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-full justify-start text-xs"
                    onClick={() => patchState({ endDate: undefined })}
                  >
                    清除结束日期
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {state.frequency === "weekly" && (
            <div className="col-span-2 space-y-2">
              <Label>星期几</Label>
              <div className="flex flex-wrap gap-3">
                {WEEKDAY_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      id={`rrule-weekday-${key}`}
                      checked={state.weekdays[key]}
                      onCheckedChange={(checked) =>
                        patchWeekday(key, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`rrule-weekday-${key}`}
                      className="cursor-pointer font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.frequency === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="rrule-day-of-month">每月哪天</Label>
              <Input
                id="rrule-day-of-month"
                type="number"
                min={1}
                max={31}
                value={String(state.dayOfMonth)}
                onChange={(e) =>
                  patchState({
                    dayOfMonth: Number.parseInt(e.target.value, 10) || 1,
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          )}

          {state.frequency === "yearly" && (
            <div className="space-y-2">
              <Label htmlFor="rrule-month">每年哪月</Label>
              <Select
                value={String(state.monthOfYear)}
                onValueChange={(v) => {
                  if (!v) return;
                  patchState({
                    monthOfYear: Number.parseInt(v, 10) || 1,
                  });
                }}
              >
                <SelectTrigger id="rrule-month" className="h-8 text-xs">
                  <SelectValue placeholder="选择月份" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      {new Date(0, month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
