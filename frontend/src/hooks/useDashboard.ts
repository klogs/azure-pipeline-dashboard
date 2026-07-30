import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import { useRealtimeUpdates } from "./useRealtimeUpdates";
import type { DashboardSummary } from "@klogs/shared";

export const DASHBOARD_KEY = ["dashboard"] as const;

export function useDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 25_000,
    refetchOnWindowFocus: false,
  });

  useRealtimeUpdates({
    onUpdate: (data) => {
      queryClient.setQueryData<DashboardSummary[]>(DASHBOARD_KEY, data);
    },
  });

  return query;
}
