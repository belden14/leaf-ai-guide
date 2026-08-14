import { confidenceBand } from "@/lib/crops";
import { cn } from "@/lib/utils";

/** Circular visual indicator of the AI confidence score. */
export function ConfidenceMeter({ confidence, size = 132 }: { confidence: number; size?: number }) {
  const pct = Math.round(confidence * 100);
  const band = confidenceBand(confidence);
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  const strokeClass =
    band.tone === "high" ? "text-success" : band.tone === "moderate" ? "text-warning" : "text-destructive";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`AI confidence ${pct} percent`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn("transition-all duration-700", strokeClass)}
          stroke="currentColor"
        />
      </svg>
      <div className="-mt-[calc(50%+0.5rem)] mb-[calc(50%-1.5rem)] text-center">
        <p className="text-3xl font-semibold tracking-tight">{pct}%</p>
        <p className="text-xs text-muted-foreground">confidence</p>
      </div>
      <p className={cn("text-sm font-medium", strokeClass)}>{band.label}</p>
      {band.hint ? <p className="max-w-xs text-center text-xs text-muted-foreground">{band.hint}</p> : null}
    </div>
  );
}
