export type RruleFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type RruleBuilderState = {
  frequency: RruleFrequency;
  interval: number;
  startDate: Date;
  endDate?: Date;
  weekdays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  dayOfMonth: number;
  monthOfYear: number;
};

const FREQ_MAP: Record<RruleFrequency, string> = {
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
  yearly: "YEARLY",
};

const FREQ_REVERSE: Record<string, RruleFrequency> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const BYDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export function formatIcalUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

export function parseIcalUtc(value: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/i.exec(
    value.trim(),
  );
  if (!match) return null;
  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6]),
    ),
  );
}

export function defaultBuilderState(): RruleBuilderState {
  const start = new Date();
  start.setUTCHours(9, 0, 0, 0);
  return {
    frequency: "daily",
    interval: 1,
    startDate: start,
    endDate: undefined,
    weekdays: {
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    dayOfMonth: 1,
    monthOfYear: 1,
  };
}

export function buildRruleString(state: RruleBuilderState): string {
  const lines: string[] = [`DTSTART:${formatIcalUtc(state.startDate)}`];
  let rule = `RRULE:FREQ=${FREQ_MAP[state.frequency]};INTERVAL=${state.interval}`;

  if (state.endDate) {
    rule += `;UNTIL=${formatIcalUtc(state.endDate)}`;
  }

  if (state.frequency === "weekly") {
    const byday: string[] = [];
    for (let i = 0; i < BYDAY_CODES.length; i++) {
      const key = WEEKDAY_KEYS[i];
      if (state.weekdays[key]) {
        byday.push(BYDAY_CODES[i]);
      }
    }
    if (byday.length === 0) {
      const dayIndex = state.startDate.getUTCDay();
      byday.push(BYDAY_CODES[dayIndex]);
    }
    rule += `;BYDAY=${byday.join(",")}`;
  }

  if (state.frequency === "monthly") {
    rule += `;BYMONTHDAY=${state.dayOfMonth}`;
  }

  if (state.frequency === "yearly") {
    rule += `;BYMONTH=${state.monthOfYear}`;
  }

  lines.push(rule);
  return lines.join("\n");
}

export function parseRruleString(rruleString: string): RruleBuilderState {
  const state = defaultBuilderState();
  if (!rruleString.trim()) {
    return state;
  }

  const lines = rruleString.split(/\r?\n/).map((l) => l.trim());
  let ruleBody = "";

  for (const line of lines) {
    if (line.toUpperCase().startsWith("DTSTART:")) {
      const parsed = parseIcalUtc(line.slice(8));
      if (parsed) state.startDate = parsed;
    } else if (line.toUpperCase().startsWith("RRULE:")) {
      ruleBody = line.slice(6);
    } else if (line.includes("FREQ=")) {
      ruleBody = line.startsWith("RRULE:") ? line.slice(6) : line;
    }
  }

  if (!ruleBody) {
    return state;
  }

  const parts = ruleBody.split(";").filter(Boolean);
  for (const part of parts) {
    const [key, rawValue] = part.split("=");
    if (!key || rawValue === undefined) continue;
    const k = key.toUpperCase();
    const v = rawValue;

    if (k === "FREQ") {
      const freq = FREQ_REVERSE[v.toUpperCase()];
      if (freq) state.frequency = freq;
    } else if (k === "INTERVAL") {
      state.interval = Number.parseInt(v, 10) || 1;
    } else if (k === "DTSTART") {
      const parsed = parseIcalUtc(v);
      if (parsed) state.startDate = parsed;
    } else if (k === "UNTIL") {
      const parsed = parseIcalUtc(v);
      if (parsed) state.endDate = parsed;
    } else if (k === "BYDAY") {
      state.frequency = "weekly";
      const days = v.split(",").map((d) => d.toUpperCase());
      state.weekdays = {
        monday: days.includes("MO"),
        tuesday: days.includes("TU"),
        wednesday: days.includes("WE"),
        thursday: days.includes("TH"),
        friday: days.includes("FR"),
        saturday: days.includes("SA"),
        sunday: days.includes("SU"),
      };
    } else if (k === "BYMONTHDAY") {
      state.frequency = "monthly";
      state.dayOfMonth = Number.parseInt(v, 10) || 1;
    } else if (k === "BYMONTH") {
      state.frequency = "yearly";
      state.monthOfYear = Number.parseInt(v, 10) || 1;
    }
  }

  return state;
}

export const FREQUENCY_LABELS: Record<RruleFrequency, string> = {
  daily: "每天",
  weekly: "每周",
  monthly: "每月",
  yearly: "每年",
};

export function frequencyToLabel(freq: RruleFrequency): string {
  return FREQUENCY_LABELS[freq];
}

export function labelToFrequency(label: string): RruleFrequency | null {
  const entry = Object.entries(FREQUENCY_LABELS).find(([, l]) => l === label);
  return entry ? (entry[0] as RruleFrequency) : null;
}
