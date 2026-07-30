import type { BuildTimeline, TimelineStage } from "@klogs/shared";

interface Props {
  timeline: BuildTimeline;
  buildResult?: string;
}

function stageColor(stage: TimelineStage): string {
  if (stage.state === "inProgress") return "text-blue-400 border-blue-500";
  if (stage.result === "succeeded") return "text-green-400 border-green-600/50";
  if (stage.result === "failed") return "text-red-400 border-red-600/50";
  if (stage.result === "canceled" || stage.result === "skipped")
    return "text-gray-600 border-gray-700";
  return "text-gray-500 border-gray-700"; // pending
}

function stageIcon(stage: TimelineStage): string {
  if (stage.state === "inProgress") return "▶";
  if (stage.result === "succeeded") return "✓";
  if (stage.result === "failed") return "✗";
  if (stage.result === "canceled") return "⊘";
  if (stage.result === "skipped") return "—";
  return "○"; // pending
}

export function StageTimeline({ timeline, buildResult }: Props) {
  const { stages } = timeline;
  if (stages.length === 0) return null;

  const failedStages = stages.filter((s) => s.result === "failed");
  const activeStage = stages.find((s) => s.state === "inProgress");

  return (
    <div className="flex flex-col gap-2 pt-1 border-t border-gray-800/60">
      {/* Stage progress bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className={[
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                stageColor(stage),
                stage.state === "inProgress" ? "bg-blue-500/10" : "bg-transparent",
              ].join(" ")}
            >
              <span>{stageIcon(stage)}</span>
              <span className="max-w-[80px] truncate">{stage.name}</span>
            </div>
            {idx < stages.length - 1 && (
              <span className="text-gray-700 text-[10px]">›</span>
            )}
          </div>
        ))}
      </div>

      {/* Active stage label */}
      {activeStage && (
        <p className="text-[11px] text-blue-400">
          <span className="animate-pulse-ring inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 mb-px" />
          Çalışıyor: <span className="font-medium">{activeStage.name}</span>
        </p>
      )}

      {/* Failure reasons */}
      {buildResult === "failed" && failedStages.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {failedStages.map((stage) => (
            <div key={stage.id} className="flex flex-col gap-0.5">
              <p className="text-[11px] font-medium text-red-400">
                ✗ {stage.name}
              </p>
              {stage.issues.length > 0
                ? stage.issues.map((issue, i) => (
                    <p
                      key={i}
                      className="text-[10px] text-gray-500 leading-snug line-clamp-2 pl-3"
                    >
                      {issue.message}
                    </p>
                  ))
                : (
                  <p className="text-[10px] text-gray-600 pl-3">
                    Detay mevcut değil
                  </p>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
