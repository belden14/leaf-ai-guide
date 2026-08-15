import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { DiagnosisReport } from "@/components/DiagnosisReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CROP_TYPES, SEVERITIES, healthStatus } from "@/lib/crops";
import {
  deleteDiagnosis,
  listDiagnoses,
  signedImageUrl,
  type DiagnosisRow,
} from "@/lib/diagnoses";

export const Route = createFileRoute("/_authenticated/history")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Diagnosis history | AgriVision AI" },
      {
        name: "description",
        content:
          "Search, filter and review every crop diagnosis saved to your AgriVision AI account, and delete records you no longer need.",
      },
      { property: "og:title", content: "Your crop diagnosis history" },
      {
        property: "og:description",
        content: "Filter past AI crop assessments by crop, disease and severity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["diagnoses"], queryFn: listDiagnoses });

  const [search, setSearch] = useState(q ?? "");
  const [crop, setCrop] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [active, setActive] = useState<DiagnosisRow | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? [])
      .filter((row) => (crop === "all" ? true : row.crop_type === crop))
      .filter((row) => (severity === "all" ? true : row.severity === severity))
      .filter((row) =>
        term
          ? row.diagnosis.toLowerCase().includes(term) || row.crop_type.toLowerCase().includes(term)
          : true,
      )
      .sort((a, b) =>
        sort === "newest"
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at),
      );
  }, [data, search, crop, severity, sort]);

  async function open(row: DiagnosisRow) {
    setActive(row);
    setActiveImage(await signedImageUrl(row.image_url));
  }

  async function remove(row: DiagnosisRow) {
    try {
      await deleteDiagnosis(row.id);
      await queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
      toast.success("Diagnosis deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete this record.");
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Diagnosis history</h1>
          <p className="mt-2 text-muted-foreground">
            Every assessment saved to your account, private to you.
          </p>
        </header>

        <section className="surface-card mt-6 grid gap-4 p-5 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="search"
                className="pl-9"
                placeholder="Disease or crop"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  navigate({ to: "/history", search: { q: e.target.value || undefined } });
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crop-filter">Crop</Label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger id="crop-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All crops</SelectItem>
                {CROP_TYPES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity-filter">Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="severity-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort by date</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your history…</p>
        ) : rows.length === 0 ? (
          <p className="surface-card mt-8 p-8 text-center text-sm text-muted-foreground">
            No diagnoses match your filters yet.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{row.diagnosis}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.crop_type} · {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{healthStatus(row.diagnosis, row.severity)}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{Math.round(row.confidence * 100)}% confidence</Badge>
                  <Badge variant="outline">Severity: {row.severity}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => open(row)}>
                    View analysis
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${row.diagnosis} diagnosis`}
                    onClick={() => remove(row)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved AI assessment</DialogTitle>
          </DialogHeader>
          {active ? (
            <DiagnosisReport
              result={{
                crop: active.crop_type,
                diagnosis: active.diagnosis,
                confidence: active.confidence,
                severity: active.severity,
                symptoms: active.symptoms,
                recommendations: active.recommendations,
                prevention: active.prevention,
              }}
              imageUrl={activeImage}
              capturedAt={active.created_at}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
