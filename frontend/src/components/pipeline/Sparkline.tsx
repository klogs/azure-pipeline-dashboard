import type { Build } from "@klogs/shared";

interface Props {
  builds: Build[];
}

function colorForBuild(b: Build): string {
  if (b.status === "inProgress") return "#60a5fa"; // blue
  switch (b.result) {
    case "succeeded":          return "#4ade80"; // green
    case "failed":             return "#f87171"; // red
    case "canceled":           return "#6b7280"; // gray
    case "partiallySucceeded": return "#fb923c"; // orange
    default:                   return "#374151"; // dark gray
  }
}

export function Sparkline({ builds }: Props) {
  const items = [...builds].reverse().slice(0, 10);
  if (items.length === 0) return null;

  return (
    <div className="flex items-end gap-0.5 h-5">
      {items.map((b, i) => (
        <div
          key={b.id ?? i}
          title={`#${b.buildNumber} — ${b.result ?? b.status}`}
          className="w-2 rounded-sm flex-shrink-0 transition-all"
          style={{ height: "100%", backgroundColor: colorForBuild(b), opacity: 0.85 }}
        />
      ))}
    </div>
  );
}
