import type { DashboardSummary, PipelineStatus } from "@klogs/shared";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const dashboardApi = {
  getDashboard: (refresh = false) =>
    get<DashboardSummary[]>(`/dashboard${refresh ? "?refresh=true" : ""}`),

  getProjectPipelines: (projectId: string) =>
    get<PipelineStatus[]>(`/projects/${projectId}/pipelines`),
};
