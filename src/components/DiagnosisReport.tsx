import { AlertTriangle, Leaf, ShieldCheck, Stethoscope } from "lucide-react";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { Badge } from "@/components/ui/badge";
import { AI_DISCLAIMER, type DiagnosisResult } from "@/lib/crops";

/** Presentational report shared by the analyze page and history detail view. */
export function DiagnosisReport({
  result,
  imageUrl,
  capturedAt,
}: {
  result: DiagnosisResult;
  imageUrl?: string | null;
  capturedAt?: string;
}) {
  const lowConfidence = result.confidence < 0.6;

  return (
    <div className="space-y-6">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Analysed ${result.crop} leaf photograph`}
              className="h-40 w-full rounded-xl object-cover md:w-56"
              loading="lazy"
            />
          ) : null}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">AI Crop Health Assessment</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {lowConfidence ? "Possible: " : ""}
              {result.diagnosis}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <Leaf className="mr-1 size-3" aria-hidden="true" />
                {result.crop}
              </Badge>
              <Badge variant="outline">Severity: {result.severity}</Badge>
              <Badge variant="outline">{Math.round(result.confidence * 100)}% confidence</Badge>
              {capturedAt ? (
                <span className="text-xs text-muted-foreground">
                  {new Date(capturedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="md:w-56">
            <ConfidenceMeter confidence={result.confidence} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <ListCard
          title="Symptoms detected"
          icon={<Stethoscope className="size-4" aria-hidden="true" />}
          items={result.symptoms}
        />
        <ListCard
          title="Recommended actions"
          icon={<Leaf className="size-4" aria-hidden="true" />}
          items={result.recommendations}
        />
        <ListCard
          title="Prevention"
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          items={result.prevention}
        />
      </div>

      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        <p>{AI_DISCLAIMER}</p>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">Nothing reported.</li>
        ) : (
          items.map((item) => (
            <li
              key={item}
              className="rounded-lg bg-secondary/60 px-3 py-2 text-sm leading-relaxed text-foreground"
            >
              {item}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
