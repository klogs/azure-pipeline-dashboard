import { AxiosInstance } from "axios";
import { Pipeline, Build, PipelineStatus, BuildTimeline, TimelineStage, TimelineIssue } from "@klogs/shared";

// ---------- Raw Azure DevOps shapes ----------

interface RawPipeline {
  id: number;
  name: string;
  folder: string;
  _links: { self: { href: string } };
}

interface RawPipelinesResponse {
  value: RawPipeline[];
  count: number;
}

interface RawBuild {
  id: number;
  buildNumber: string;
  status: string;
  result?: string;
  queueTime: string;
  startTime?: string;
  finishTime?: string;
  requestedFor: { displayName: string; imageUrl?: string };
  sourceBranch: string;
  triggerInfo?: Record<string, string>;
  _links: { web: { href: string } };
  definition: { id: number };
}

interface RawBuildsResponse {
  value: RawBuild[];
  count: number;
}

interface RawTimelineIssue {
  type: string;
  message: string;
}

interface RawTimelineRecord {
  id: string;
  parentId?: string;
  type: string;
  name: string;
  order: number;
  state: string;   // "pending" | "inProgress" | "completed"
  result?: string; // "succeeded" | "failed" | "canceled" | "skipped"
  errorCount: number;
  issues?: RawTimelineIssue[];
}

interface RawTimelineResponse {
  records: RawTimelineRecord[];
}

// ---------- Mappers ----------

function mapPipeline(raw: RawPipeline, projectId: string, projectName: string): Pipeline {
  return {
    id: raw.id,
    name: raw.name,
    projectId,
    projectName,
    folder: raw.folder ?? "\\",
    url: raw._links.self.href,
  };
}

function mapBuild(raw: RawBuild): Build {
  return {
    id: raw.id,
    buildNumber: raw.buildNumber,
    status: raw.status as Build["status"],
    result: raw.result as Build["result"],
    queueTime: raw.queueTime,
    startTime: raw.startTime,
    finishTime: raw.finishTime,
    requestedBy: {
      displayName: raw.requestedFor?.displayName ?? "Unknown",
      imageUrl: raw.requestedFor?.imageUrl,
    },
    sourceBranch: raw.sourceBranch,
    triggerInfo: raw.triggerInfo,
    url: raw._links?.web?.href ?? "",
  };
}

function mapTimeline(records: RawTimelineRecord[]): BuildTimeline {
  const stages = records
    .filter((r) => r.type === "Stage")
    .sort((a, b) => a.order - b.order)
    .map((r): TimelineStage => ({
      id: r.id,
      name: r.name,
      order: r.order,
      state: r.state as TimelineStage["state"],
      result: r.result as TimelineStage["result"],
      errorCount: r.errorCount ?? 0,
      issues: (r.issues ?? [])
        .filter((i) => i.type === "error" || i.type === "warning")
        .map((i): TimelineIssue => ({ type: i.type as "error" | "warning", message: i.message }))
        .slice(0, 5), // en fazla 5 issue
    }));

  // Stage'lerin issue'ları yoksa, başarısız job'lardan topla
  if (stages.some((s) => s.result === "failed" && s.issues.length === 0)) {
    const failedJobs = records.filter(
      (r) => (r.type === "Job" || r.type === "Task") &&
              r.result === "failed" &&
              (r.issues?.length ?? 0) > 0
    );
    for (const stage of stages) {
      if (stage.result !== "failed") continue;
      const stageJobs = failedJobs.filter((j) => {
        // job'un parent zincirini takip ederek stage'e bağlı mı kontrol et
        let cur: RawTimelineRecord | undefined = j;
        while (cur?.parentId) {
          if (cur.parentId === stage.id) return true;
          cur = records.find((r) => r.id === cur!.parentId);
        }
        return false;
      });
      stage.issues = stageJobs
        .flatMap((j) => j.issues ?? [])
        .filter((i) => i.type === "error")
        .map((i): TimelineIssue => ({ type: "error", message: i.message }))
        .slice(0, 5);
    }
  }

  return { stages };
}

// ---------- API calls ----------

export async function listPipelines(
  client: AxiosInstance,
  projectName: string,
  projectId: string
): Promise<Pipeline[]> {
  const response = await client.get<RawPipelinesResponse>(
    `/${encodeURIComponent(projectName)}/_apis/pipelines`,
    { params: { "api-version": "7.1" } }
  );
  return response.data.value.map((r) => mapPipeline(r, projectId, projectName));
}

export async function getRecentBuilds(
  client: AxiosInstance,
  projectName: string,
  definitionId: number,
  top = 5
): Promise<Build[]> {
  const response = await client.get<RawBuildsResponse>(
    `/${encodeURIComponent(projectName)}/_apis/build/builds`,
    {
      params: {
        "api-version": "7.1",
        definitions: definitionId,
        $top: top,
        queryOrder: "queueTimeDescending",
      },
    }
  );
  return response.data.value.map(mapBuild);
}

export async function getTimeline(
  client: AxiosInstance,
  projectName: string,
  buildId: number
): Promise<BuildTimeline | undefined> {
  try {
    const response = await client.get<RawTimelineResponse>(
      `/${encodeURIComponent(projectName)}/_apis/build/builds/${buildId}/timeline`,
      { params: { "api-version": "7.1" } }
    );
    const records = response.data?.records ?? [];
    if (records.length === 0) return undefined;
    return mapTimeline(records);
  } catch {
    return undefined; // timeline yoksa sessizce geç
  }
}

export async function getPipelineStatuses(
  client: AxiosInstance,
  projectName: string,
  projectId: string
): Promise<PipelineStatus[]> {
  const pipelines = await listPipelines(client, projectName, projectId);

  const results: PipelineStatus[] = [];
  const CHUNK = 5;

  for (let i = 0; i < pipelines.length; i += CHUNK) {
    const chunk = pipelines.slice(i, i + CHUNK);
    const chunkResults = await Promise.all(
      chunk.map(async (pipeline): Promise<PipelineStatus> => {
        const recentBuilds = await getRecentBuilds(client, projectName, pipeline.id);
        const lastBuild = recentBuilds[0];

        // Timeline yalnızca çalışan veya başarısız build'ler için çek
        let timeline: BuildTimeline | undefined;
        if (lastBuild && (lastBuild.status === "inProgress" || lastBuild.result === "failed")) {
          timeline = await getTimeline(client, projectName, lastBuild.id);
        }

        return { pipeline, lastBuild, recentBuilds, timeline };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}
