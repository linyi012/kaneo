import { HTTPException } from "hono/http-exception";
import { DEFAULT_PROJECT_COLUMNS } from "../project/controllers/create-project";
import { VALID_PRIORITIES } from "../task/validate-task-fields";

export const DEFAULT_TEMPLATE_STATUSES = DEFAULT_PROJECT_COLUMNS.map(
  (col) => col.slug,
);

export function assertValidTemplateStatus(status: string): void {
  if (!(DEFAULT_TEMPLATE_STATUSES as readonly string[]).includes(status)) {
    throw new HTTPException(400, {
      message: `Invalid status "${status}". Valid values: ${DEFAULT_TEMPLATE_STATUSES.join(", ")}`,
    });
  }
}

export function assertValidTemplatePriority(priority: string): void {
  if (!(VALID_PRIORITIES as readonly string[]).includes(priority)) {
    throw new HTTPException(400, {
      message: `Invalid priority "${priority}". Valid values: ${VALID_PRIORITIES.join(", ")}`,
    });
  }
}
