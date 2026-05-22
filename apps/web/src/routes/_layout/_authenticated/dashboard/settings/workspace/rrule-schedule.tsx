import {
  assertValidWorkspaceRruleSchedule,
  parseWorkspaceRruleSchedule,
  type WorkspaceRruleSchedule,
} from "@kaneo/libs";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import useUpdateWorkspace from "@/hooks/mutations/workspace/use-update-workspace";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import {
  buildDefaultTimezoneList,
  filterTimezones,
  formatTimezoneOption,
  getAllTimezones,
} from "@/lib/timezone-options";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/workspace/rrule-schedule",
)({
  component: RouteComponent,
});

function scheduleToTimeValue(schedule: WorkspaceRruleSchedule): string {
  return `${String(schedule.runAtHour).padStart(2, "0")}:${String(schedule.runAtMinute).padStart(2, "0")}`;
}

function timeValueToSchedule(
  timeValue: string,
  base: WorkspaceRruleSchedule,
): WorkspaceRruleSchedule {
  const [hourPart, minutePart] = timeValue.split(":");
  const runAtHour = Number.parseInt(hourPart ?? "9", 10);
  const runAtMinute = Number.parseInt(minutePart ?? "0", 10);
  return {
    ...base,
    runAtHour: Number.isNaN(runAtHour) ? base.runAtHour : runAtHour,
    runAtMinute: Number.isNaN(runAtMinute) ? base.runAtMinute : runAtMinute,
  };
}

function RouteComponent() {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const { isAdmin, isOwner } = useWorkspacePermission();
  const canEdit = isAdmin || isOwner;
  const queryClient = useQueryClient();
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();

  const savedSchedule = useMemo(
    () => parseWorkspaceRruleSchedule(workspace ?? undefined),
    [workspace],
  );

  const [timezone, setTimezone] = useState(savedSchedule.timezone);
  const [runAtTime, setRunAtTime] = useState(
    scheduleToTimeValue(savedSchedule),
  );
  const [timezoneQuery, setTimezoneQuery] = useState("");

  useEffect(() => {
    setTimezone(savedSchedule.timezone);
    setRunAtTime(scheduleToTimeValue(savedSchedule));
  }, [savedSchedule]);

  const allTimezones = useMemo(() => getAllTimezones(), []);
  const filteredTimezones = useMemo(
    () => filterTimezones(timezoneQuery, allTimezones).slice(0, 150),
    [timezoneQuery, allTimezones],
  );

  const displayTimezones = timezoneQuery.trim()
    ? filteredTimezones
    : buildDefaultTimezoneList(allTimezones, timezone);

  const hasChanges =
    timezone !== savedSchedule.timezone ||
    runAtTime !== scheduleToTimeValue(savedSchedule);

  const handleSave = async () => {
    if (!workspace?.id || !canEdit) return;

    const draft = timeValueToSchedule(runAtTime, {
      timezone,
      runAtHour: savedSchedule.runAtHour,
      runAtMinute: savedSchedule.runAtMinute,
    });

    try {
      assertValidWorkspaceRruleSchedule(draft);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("settings:workspaceRruleSchedule.toastUpdateError"),
      );
      return;
    }

    try {
      await updateWorkspace({
        workspaceId: workspace.id,
        rruleTimezone: draft.timezone,
        rruleRunAtHour: draft.runAtHour,
        rruleRunAtMinute: draft.runAtMinute,
      });
      await queryClient.invalidateQueries({
        queryKey: ["active-organization"],
      });
      toast.success(t("settings:workspaceRruleSchedule.toastUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("settings:workspaceRruleSchedule.toastUpdateError"),
      );
    }
  };

  return (
    <>
      <PageTitle title={t("settings:workspaceRruleSchedule.pageTitle")} />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            {t("settings:workspaceRruleSchedule.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings:workspaceRruleSchedule.subtitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("settings:workspaceRruleSchedule.scopeNote")}
          </p>
        </div>

        <div className="space-y-6 border border-border rounded-md p-4 bg-sidebar">
          <div className="space-y-2">
            <Label htmlFor="rrule-timezone-search">
              {t("settings:workspaceRruleSchedule.timezoneLabel")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("settings:workspaceRruleSchedule.timezoneHint")}
            </p>
            <Input
              id="rrule-timezone-search"
              value={timezoneQuery}
              onChange={(e) => setTimezoneQuery(e.target.value)}
              placeholder={t(
                "settings:workspaceRruleSchedule.timezoneSearchPlaceholder",
              )}
              disabled={!canEdit}
              className="max-w-md"
            />
            <ScrollArea className="h-48 max-w-md rounded-md border border-border">
              <div className="p-1">
                {displayTimezones.length === 0 && (
                  <p className="px-2 py-3 text-xs text-muted-foreground">
                    {t("settings:workspaceRruleSchedule.timezoneNoResults")}
                  </p>
                )}
                {displayTimezones.map((tz) => (
                  <Button
                    key={tz}
                    type="button"
                    variant={timezone === tz ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-full justify-start text-xs font-normal"
                    disabled={!canEdit}
                    onClick={() => setTimezone(tz)}
                  >
                    {formatTimezoneOption(tz)}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              {formatTimezoneOption(timezone)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rrule-run-at">
              {t("settings:workspaceRruleSchedule.runAtLabel")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("settings:workspaceRruleSchedule.runAtHint")}
            </p>
            <Input
              id="rrule-run-at"
              type="time"
              value={runAtTime}
              onChange={(e) => setRunAtTime(e.target.value)}
              disabled={!canEdit}
              className="max-w-[10rem]"
            />
          </div>

          {!canEdit && (
            <p className="text-xs text-muted-foreground">
              {t("settings:workspaceRruleSchedule.readOnlyNote")}
            </p>
          )}

          {canEdit && (
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!hasChanges || isPending}
            >
              {isPending
                ? t("settings:workspaceRruleSchedule.saving")
                : t("settings:workspaceRruleSchedule.save")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
