export type BuildResult = "succeeded" | "failed" | "canceled" | "partiallySucceeded";
export type BuildStatus = "completed" | "inProgress" | "notStarted" | "cancelling" | "postponed" | "none";
export type StageState = "pending" | "inProgress" | "completed";
export type StageResult = "succeeded" | "failed" | "canceled" | "skipped" | "partiallySucceeded";

export interface Pipeline {
  id: number;
  name: string;
  projectId: string;
  projectName: string;
  folder: string;
  url: string;
}

export interface Build {
  id: number;
  buildNumber: string;
  status: BuildStatus;
  result?: BuildResult;
  queueTime: string;
  startTime?: string;
  finishTime?: string;
  requestedBy: {
    displayName: string;
    imageUrl?: string;
  };
  sourceBranch: string;
  triggerInfo?: Record<string, string>;
  url: string;
}

export interface TimelineIssue {
  type: "error" | "warning";
  message: string;
}

export interface TimelineStage {
  id: string;
  name: string;
  order: number;
  state: StageState;
  result?: StageResult;
  errorCount: number;
  issues: TimelineIssue[];
}

export interface BuildTimeline {
  stages: TimelineStage[];
}

export interface PipelineStatus {
  pipeline: Pipeline;
  lastBuild?: Build;
  recentBuilds: Build[];
  timeline?: BuildTimeline;
}

export interface DashboardSummary {
  projectName: string;
  projectId: string;
  pipelines: PipelineStatus[];
  stats: {
    total: number;
    succeeded: number;
    failed: number;
    running: number;
    other: number;
  };
}
