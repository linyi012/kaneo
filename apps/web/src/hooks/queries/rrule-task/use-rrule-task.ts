import { useQuery } from "@tanstack/react-query";
import getRruleTask from "@/fetchers/rrule-task/get-rrule-task";

export function useRruleTask(id: string) {
  return useQuery({
    queryKey: ["rrule-task", id],
    queryFn: () => getRruleTask(id),
    enabled: Boolean(id),
  });
}
