import type { PipelineStatus } from "@klogs/shared";
import { StatusBadge } from "./StatusBadge";
import { Sparkline } from "./Sparkline";
import { StageTimeline } from "./StageTimeline";

interface Props {
  pipelineStatus: PipelineStatus;
}

function formatDuration(startTime?: string, finishTime?: string): string {
  if (!startTime || !finishTime) return "—";
  const ms = new Date(finishTime).getTime() - new Date(startTime).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}d ${rem}s` : `${m}d`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  return `${Math.floor(h / 24)}g önce`;
}

export function PipelineCard({ pipelineStatus }: Props) {
  const { pipeline, lastBuild, recentBuilds, timeline } = pipelineStatus;
  const isFailed = lastBuild?.result === "failed";
  const isRunning = lastBuild?.status === "inProgress";
  const showTimeline = timeline && (isRunning || isFailed);

  return (
    <a
      href={lastBuild?.url ?? pipeline.url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group flex flex-col gap-3 rounded-xl p-4 border transition-all duration-150",
        "hover:border-gray-600 hover:bg-gray-800/60",
        isFailed
          ? "bg-red-950/20 border-red-800/40"
          : isRunning
          ? "bg-blue-950/20 border-blue-800/30"
          : "bg-gray-900 border-gray-800",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate leading-tight group-hover:text-white">
            {pipeline.name}
          </p>
          {pipeline.folder && pipeline.folder !== "\\" && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{pipeline.folder}</p>
          )}
        </div>
        <StatusBadge status={lastBuild?.status} result={lastBuild?.result} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        <span title="Tetikleyen">{lastBuild?.requestedBy.displayName ?? "—"}</span>
        <span className="text-gray-700">·</span>
        <span title="Branch">{lastBuild?.sourceBranch?.replace("refs/heads/", "") ?? "—"}</span>
        <span className="text-gray-700">·</span>
        <span title="Süre">{formatDuration(lastBuild?.startTime, lastBuild?.finishTime)}</span>
        <span className="ml-auto" title="Son çalışma">
          {timeAgo(lastBuild?.finishTime ?? lastBuild?.startTime)}
        </span>
      </div>

      {/* Stage timeline — sadece çalışan veya başarısız build'lerde */}
      {showTimeline && (
        <StageTimeline timeline={timeline} buildResult={lastBuild?.result} />
      )}

      {/* Sparkline */}
      <Sparkline builds={recentBuilds} />
    </a>
  );
}
