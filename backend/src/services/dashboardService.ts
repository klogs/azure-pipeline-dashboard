import { DashboardSummary } from "@klogs/shared";
import { getClientFromEnv } from "../azureDevOps/client";
import { listProjects } from "../azureDevOps/projectsApi";
import { getPipelineStatuses } from "../azureDevOps/pipelinesApi";
import { cacheGet, cacheSet } from "./cache";

const CACHE_KEY = "dashboard:all";
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);

function computeStats(pipelines: DashboardSummary["pipelines"]): DashboardSummary["stats"] {
  let succeeded = 0, failed = 0, running = 0, other = 0;
  for (const { lastBuild } of pipelines) {
    if (!lastBuild) { other++; continue; }
    if (lastBuild.status === "inProgress") { running++; continue; }
    switch (lastBuild.result) {
      case "succeeded": succeeded++; break;
      case "failed":    failed++;    break;
      default:          other++;
    }
  }
  return { total: pipelines.length, succeeded, failed, running, other };
}

export async function getDashboard(forceRefresh = false): Promise<DashboardSummary[]> {
  if (!forceRefresh) {
    const cached = cacheGet<DashboardSummary[]>(CACHE_KEY);
    if (cached) return cached;
  }

  const client = getClientFromEnv();
  const projects = await listProjects(client);

  const summaries = await Promise.all(
    projects.map(async (project): Promise<DashboardSummary> => {
      const pipelines = await getPipelineStatuses(client, project.name, project.id);
      return {
        projectName: project.name,
        projectId: project.id,
        pipelines,
        stats: computeStats(pipelines),
      };
    })
  );

  cacheSet(CACHE_KEY, summaries, TTL);
  return summaries;
}
