import { useEffect } from "react";
import { getAppName } from "@/lib/app-branding";

type PageTitleProps = {
  title: string;
  suffix?: string;
  hideAppName?: boolean;
};

export default function PageTitle({
  title,
  suffix = getAppName(),
  hideAppName = false,
}: PageTitleProps) {
  useEffect(() => {
    const formattedTitle = hideAppName
      ? title
      : suffix
        ? `${title} — ${suffix}`
        : title;
    document.title = formattedTitle;
  }, [title, suffix, hideAppName]);

  return null;
}
