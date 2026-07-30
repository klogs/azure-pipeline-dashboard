import type { BuildResult, BuildStatus } from "@klogs/shared";

interface Props {
  status?: BuildStatus;
  result?: BuildResult;
  size?: "sm" | "md";
}

interface BadgeConfig {
  label: string;
  className: string;
  dot?: string;
}

function resolveBadge(status?: BuildStatus, result?: BuildResult): BadgeConfig {
  if (status === "inProgress") {
    return {
      label: "Çalışıyor",
      className: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
      dot: "bg-blue-400 animate-pulse-ring",
    };
  }
  if (status === "notStarted" || status === "postponed") {
    return {
      label: "Kuyrukta",
      className: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
      dot: "bg-amber-400",
    };
  }
  if (status === "cancelling") {
    return {
      label: "İptal ediliyor",
      className: "bg-gray-500/15 text-gray-300 border border-gray-500/30",
      dot: "bg-gray-400",
    };
  }

  switch (result) {
    case "succeeded":
      return {
        label: "Başarılı",
        className: "bg-green-500/15 text-green-300 border border-green-500/30",
        dot: "bg-green-400",
      };
    case "failed":
      return {
        label: "Başarısız",
        className: "bg-red-500/15 text-red-300 border border-red-500/30",
        dot: "bg-red-400",
      };
    case "canceled":
      return {
        label: "İptal",
        className: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
        dot: "bg-gray-500",
      };
    case "partiallySucceeded":
      return {
        label: "Kısmi",
        className: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
        dot: "bg-orange-400",
      };
    default:
      return {
        label: "Bilinmiyor",
        className: "bg-gray-700/30 text-gray-500 border border-gray-700",
        dot: "bg-gray-600",
      };
  }
}

export function StatusBadge({ status, result, size = "md" }: Props) {
  const { label, className, dot } = resolveBadge(status, result);
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${textSize} ${className}`}
    >
      {dot && <span className={`rounded-full flex-shrink-0 ${dotSize} ${dot}`} />}
      {label}
    </span>
  );
}
