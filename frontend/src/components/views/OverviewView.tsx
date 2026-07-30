import type { DashboardSummary } from "@klogs/shared";
import { PipelineCard } from "../pipeline/PipelineCard";

interface Props {
  summaries: DashboardSummary[];
  onSelectProject: (id: string) => void;
}

export function OverviewView({ summaries, onSelectProject }: Props) {
  // Başarısız pipeline'ı olan projeleri üste al
  const sorted = [...summaries].sort((a, b) => b.stats.failed - a.stats.failed);

  // Tüm başarısız pipeline'ları global kritik uyarı olarak topla
  const criticalPipelines = summaries
    .flatMap((s) => s.pipelines.filter((ps) => ps.lastBuild?.result === "failed"))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* Kritik uyarılar */}
      {criticalPipelines.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h2 className="text-sm font-semibold text-red-400">
              Başarısız Pipeline'lar ({criticalPipelines.length})
            </h2>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {criticalPipelines.map((ps) => (
              <PipelineCard key={`${ps.pipeline.projectId}-${ps.pipeline.id}`} pipelineStatus={ps} />
            ))}
          </div>
        </section>
      )}

      {/* Proje özetleri */}
      <section className="flex flex-col gap-6">
        {sorted.filter((s) => s.stats.total > 0).map((s) => (
          <ProjectSection
            key={s.projectId}
            summary={s}
            onExpand={() => onSelectProject(s.projectId)}
          />
        ))}
      </section>
    </div>
  );
}

function ProjectSection({
  summary,
  onExpand,
}: {
  summary: DashboardSummary;
  onExpand: () => void;
}) {
  const preview = [...summary.pipelines]
    .sort((a, b) => {
      const aFail = a.lastBuild?.result === "failed" ? 0 : 1;
      const bFail = b.lastBuild?.result === "failed" ? 0 : 1;
      return aFail - bFail;
    })
    .slice(0, 4);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-200">{summary.projectName}</h2>
        <div className="flex items-center gap-2">
          <StatusStat value={summary.stats.succeeded} color="text-green-400" label="başarılı" />
          {summary.stats.failed > 0 && (
            <StatusStat value={summary.stats.failed} color="text-red-400" label="başarısız" />
          )}
          {summary.stats.running > 0 && (
            <StatusStat value={summary.stats.running} color="text-blue-400" label="çalışıyor" />
          )}
        </div>
        <button
          onClick={onExpand}
          className="ml-auto text-xs text-gray-600 hover:text-gray-300 transition-colors"
        >
          Tümünü gör →
        </button>
      </div>

      {/* Preview grid */}
      {preview.length === 0 ? (
        <p className="text-xs text-gray-600">Pipeline bulunamadı.</p>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {preview.map((ps) => (
            <PipelineCard key={`${ps.pipeline.projectId}-${ps.pipeline.id}`} pipelineStatus={ps} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusStat({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <span className={`text-xs font-medium ${color}`}>
      {value} {label}
    </span>
  );
}
