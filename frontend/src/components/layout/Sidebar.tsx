import { useRef, useState, useEffect, useCallback } from "react";
import type { DashboardSummary } from "@klogs/shared";

const MIN_WIDTH = 160;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 224;

interface Props {
  summaries: DashboardSummary[];
  selected: string | null;
  onSelect: (projectId: string | null) => void;
}

export function Sidebar({ summaries, selected, onSelect }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
    setWidth(next);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <nav
      className="relative flex-shrink-0 border-r border-gray-800 bg-gray-950 flex flex-col overflow-y-auto overflow-x-hidden"
      style={{ width }}
    >
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2">
          Projeler
        </p>
      </div>

      {/* Overview */}
      <button
        onClick={() => onSelect(null)}
        className={[
          "w-full text-left px-4 py-2 text-sm rounded-lg mx-1 transition-colors",
          selected === null
            ? "bg-gray-800 text-white font-medium"
            : "text-gray-400 hover:bg-gray-900 hover:text-gray-200",
        ].join(" ")}
      >
        Genel Bakış
      </button>

      <div className="h-px bg-gray-800 mx-3 my-2" />

      {summaries.filter((s) => s.stats.total > 0).map((s) => {
        const hasFailed = s.stats.failed > 0;
        const isSelected = selected === s.projectId;
        return (
          <button
            key={s.projectId}
            onClick={() => onSelect(s.projectId)}
            className={[
              "w-full text-left px-4 py-2 text-sm rounded-lg mx-1 flex items-center gap-2 transition-colors",
              isSelected
                ? "bg-gray-800 text-white font-medium"
                : "text-gray-400 hover:bg-gray-900 hover:text-gray-200",
            ].join(" ")}
          >
            <span
              className={[
                "w-2 h-2 rounded-full flex-shrink-0",
                hasFailed
                  ? "bg-red-500"
                  : s.stats.running > 0
                  ? "bg-blue-400 animate-pulse-ring"
                  : "bg-green-500/70",
              ].join(" ")}
            />
            <span className="truncate">{s.projectName}</span>
            {hasFailed && (
              <span className="ml-auto text-[10px] font-medium text-red-400 flex-shrink-0">
                {s.stats.failed}
              </span>
            )}
          </button>
        );
      })}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize group"
        title="Genişliği ayarla"
      >
        {/* Visible indicator on hover */}
        <div className="absolute inset-y-0 right-0 w-1 bg-transparent group-hover:bg-blue-500/40 transition-colors" />
      </div>
    </nav>
  );
}
