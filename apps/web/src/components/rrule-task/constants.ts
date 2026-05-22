import type { WorkspaceRruleSchedule } from "@kaneo/libs";
import { buildRruleString, defaultBuilderState } from "./rrule-builder-utils";

export function getDefaultRrule(schedule?: WorkspaceRruleSchedule): string {
  return buildRruleString(defaultBuilderState(schedule));
}
