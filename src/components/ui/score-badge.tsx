import { Star } from "lucide-react";

export function ScoreBadge({
  score,
  size = "sm",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  let color = "bg-green-500/10 text-green-600 border-green-500/20";
  if (score < 8) color = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (score < 7) color = "bg-red-500/10 text-red-600 border-red-500/20";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSize = size === "lg" ? "h-4 w-4" : "h-3 w-3";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold border ${color} ${sizeClasses[size]}`}
    >
      <Star className={iconSize} />
      {score.toFixed(1)}
    </span>
  );
}
