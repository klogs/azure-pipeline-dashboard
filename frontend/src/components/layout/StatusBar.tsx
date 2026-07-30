import type { DashboardSummary } from "@klogs/shared";

interface Props {
  summaries: DashboardSummary[];
  lastUpdated: Date | null;
}

export function StatusBar({ summaries, lastUpdated }: Props) {
  const totals = summaries.reduce(
    (acc, s) => ({
      total:     acc.total     + s.stats.total,
      succeeded: acc.succeeded + s.stats.succeeded,
      failed:    acc.failed    + s.stats.failed,
      running:   acc.running   + s.stats.running,
      other:     acc.other     + s.stats.other,
    }),
    { total: 0, succeeded: 0, failed: 0, running: 0, other: 0 }
  );

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <header className="flex items-center gap-6 px-5 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-blue-400 font-semibold text-sm tracking-wide">KLOGS</span>
        <span className="text-gray-600 text-xs">Pipeline Dashboard</span>
      </div>

      <div className="h-4 w-px bg-gray-800" />

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <Stat label="Toplam"      value={totals.total}     color="text-gray-300" />
        <Stat label="Başarılı"    value={totals.succeeded} color="text-green-400" />
        <Stat label="Başarısız"   value={totals.failed}    color="text-red-400"  />
        <Stat label="Çalışıyor"   value={totals.running}   color="text-blue-400" />
      </div>

      <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-600">
        {totals.running > 0 && (
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-ring" />
            Canlı
          </span>
        )}
        {timeStr && <span>Son güncelleme: {timeStr}</span>}
      </div>
    </header>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
