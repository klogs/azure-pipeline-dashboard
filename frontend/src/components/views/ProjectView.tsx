import { useState } from "react";
import type { DashboardSummary } from "@klogs/shared";
import { PipelineCard } from "../pipeline/PipelineCard";

type Filter = "all" | "failed" | "running";

interface Props {
  summary: DashboardSummary;
}

export function ProjectView({ summary }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = summary.pipelines.filter((ps) => {
    if (search && !ps.pipeline.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "failed" && ps.lastBuild?.result !== "failed") return false;
    if (filter === "running" && ps.lastBuild?.status !== "inProgress") return false;
    return true;
  });

  // Failed ones bubble to the top
  const sorted = [...filtered].sort((a, b) => {
    const aFail = a.lastBuild?.result === "failed" ? 0 : 1;
    const bFail = b.lastBuild?.result === "failed" ? 0 : 1;
    return aFail - bFail;
  });

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{summary.projectName}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {summary.stats.total} pipeline · {summary.stats.succeeded} başarılı ·{" "}
            {summary.stats.failed} başarısız · {summary.stats.running} çalışıyor
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Pipeline ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gray-500 w-44"
          />

          {/* Filter tabs */}
          <div className="flex rounded-lg border border-gray-700 overflow-hidden text-xs">
            {(["all", "failed", "running"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "px-3 py-1.5 transition-colors",
                  filter === f
                    ? "bg-gray-700 text-white font-medium"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800",
                ].join(" ")}
              >
                {f === "all" ? "Tümü" : f === "failed" ? "Başarısız" : "Çalışıyor"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-600 text-sm">
          Sonuç bulunamadı.
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((ps) => (
            <PipelineCard key={ps.pipeline.id} pipelineStatus={ps} />
          ))}
        </div>
      )}
    </div>
  );
}
