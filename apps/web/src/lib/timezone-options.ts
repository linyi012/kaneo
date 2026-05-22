const POPULAR_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

/** Country / city names users may search (IANA ids use Region/City). */
const TIMEZONE_SEARCH_ALIASES: Record<string, readonly string[]> = {
  "Africa/Nairobi": ["kenya", "nairobi", "肯尼亚", "东非"],
  "Africa/Cairo": ["egypt", "cairo", "埃及"],
  "Africa/Johannesburg": ["south africa", "johannesburg", "南非"],
  "Africa/Lagos": ["nigeria", "lagos", "尼日利亚"],
  "Africa/Accra": ["ghana", "加纳"],
  "Africa/Addis_Ababa": ["ethiopia", "埃塞俄比亚"],
  "Africa/Casablanca": ["morocco", "摩洛哥"],
  "Africa/Tunis": ["tunisia", "突尼斯"],
  "Asia/Shanghai": ["china", "beijing", "中国", "北京"],
  "Asia/Hong_Kong": ["hong kong", "香港"],
  "Asia/Tokyo": ["japan", "日本"],
  "Asia/Seoul": ["korea", "韩国"],
  "Asia/Singapore": ["singapore", "新加坡"],
  "Asia/Kolkata": ["india", "印度"],
  "Europe/London": ["uk", "britain", "英国"],
  "Europe/Paris": ["france", "法国"],
  "Europe/Berlin": ["germany", "德国"],
};

let cachedTimezones: string[] | null = null;

export function getAllTimezones(): string[] {
  if (cachedTimezones) {
    return cachedTimezones;
  }
  if (typeof Intl.supportedValuesOf === "function") {
    cachedTimezones = Intl.supportedValuesOf("timeZone").sort();
    return cachedTimezones;
  }
  cachedTimezones = [...POPULAR_TIMEZONES];
  return cachedTimezones;
}

export function getTimezoneOffsetLabel(
  timezone: string,
  at = new Date(),
): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const part = formatter
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? "";
  } catch {
    return "";
  }
}

export function formatTimezoneOption(timezone: string): string {
  const offset = getTimezoneOffsetLabel(timezone);
  return offset ? `${timezone} (${offset})` : timezone;
}

function getTimezoneSearchHaystack(timezone: string): string {
  const city = timezone.split("/").pop()?.replace(/_/g, " ") ?? "";
  const aliases = TIMEZONE_SEARCH_ALIASES[timezone] ?? [];
  return [timezone, city, formatTimezoneOption(timezone), ...aliases]
    .join(" ")
    .toLowerCase();
}

export function filterTimezones(query: string, timezones: string[]): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return timezones;
  }
  return timezones.filter((timezone) =>
    getTimezoneSearchHaystack(timezone).includes(normalized),
  );
}

export function buildDefaultTimezoneList(
  allTimezones: string[],
  selectedTimezone?: string,
): string[] {
  const popular = getPopularTimezones();
  if (
    selectedTimezone &&
    allTimezones.includes(selectedTimezone) &&
    !popular.includes(selectedTimezone)
  ) {
    return [selectedTimezone, ...popular];
  }
  return popular;
}

export function getPopularTimezones(): string[] {
  const all = new Set(getAllTimezones());
  return POPULAR_TIMEZONES.filter((timezone) => all.has(timezone));
}
