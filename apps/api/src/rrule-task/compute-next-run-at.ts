import { HTTPException } from "hono/http-exception";
import rruleModule from "rrule";

function parseRruleString(rruleString: string) {
  const { rrulestr } = rruleModule as {
    rrulestr: (value: string) => {
      after: (date: Date, inc?: boolean) => Date | null;
    };
  };
  return rrulestr(rruleString);
}

export function computeNextRunAt(
  rruleString: string,
  after: Date,
): Date | null {
  try {
    const rule = parseRruleString(rruleString);
    const next = rule.after(after, true);
    return next ?? null;
  } catch {
    throw new HTTPException(400, {
      message: "Invalid RRULE string",
    });
  }
}

export function advanceNextRunAtAfter(
  rruleString: string,
  occurrence: Date,
  now: Date,
): Date | null {
  const rule = parseRruleString(rruleString);
  const nextAfterOccurrence = rule.after(occurrence, false);
  if (nextAfterOccurrence && nextAfterOccurrence > now) {
    return nextAfterOccurrence;
  }
  return rule.after(now, false);
}
