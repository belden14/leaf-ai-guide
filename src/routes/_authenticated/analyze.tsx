import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, Camera, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { DiagnosisReport } from "@/components/DiagnosisReport";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CROP_TYPES, validateImageFile, type DiagnosisResult } from "@/lib/crops";
import { analyzeCrop } from "@/lib/diagnosis.functions";
import { saveDiagnosis } from "@/lib/diagnoses";

export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a crop photo | AgriVision AI" },
      {
        name: "description",
        content:
          "Upload or capture a crop leaf photograph and receive an AI assessment with symptoms, treatment and prevention guidance.",
      },
      { property: "og:title", content: "Analyze a crop photo with AgriVision AI" },
      {
        property: "og:description",
        content: "AI-powered leaf analysis for tomato, maize, cassava, rice and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function AnalyzePage() {
  const navigate = useNavigate();
  const runAnalysis = useServerFn(analyzeCrop);
  const inputRef = useRef<HTMLInputElement>(null);

  const [cropType, setCropType] = useState<string>("Tomato");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [unclear, setUnclear] = useState<string | null>(null);

  const accept = useCallback((selected: File | null) => {
    const error = validateImageFile(selected);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(selected);
    setResult(null);
    setUnclear(null);
    setSaved(false);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }, []);

  async function analyze() {
    const error = validateImageFile(file);
    if (error || !file) {
      toast.error(error ?? "Please select an image.");
      return;
    }
    setBusy(true);
    setResult(null);
    setUnclear(null);
    try {
      const imageDataUrl = await readAsDataUrl(file);
      const response = await runAnalysis({ data: { cropType, imageDataUrl } });
      if (response.unclear) {
        setUnclear(
          response.message ??
            "Unable to confidently analyze this image. Please upload a clear photograph showing the affected part of the plant.",
        );
      } else {
        setResult(response as DiagnosisResult);
      }
    } catch (err) {
      console.error(err);
      toast.error("The AI analysis could not be completed. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      await saveDiagnosis(result, cropType, file);
      setSaved(true);
      toast.success("Diagnosis saved to your history.");
    } catch (err) {
      console.error(err);
      toast.error("Could not save this diagnosis. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setUnclear(null);
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Analyze a crop</h1>
          <p className="mt-2 text-muted-foreground">
            Photograph the affected leaf in good daylight, fill the frame, and keep it in focus.
          </p>
        </header>

        <section className="surface-card mt-6 p-6">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="crop">Crop type</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger id="crop">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_TYPES.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Leaf photograph</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  accept(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview of the selected crop leaf"
                    className="mx-auto max-h-64 rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a JPG, PNG or WEBP image here (max 10 MB)
                  </p>
                )}

                <input
                  ref={inputRef}
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => accept(e.target.files?.[0] ?? null)}
                />

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                    <Upload className="mr-2 size-4" aria-hidden="true" />
                    Browse image
                  </Button>
                  <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                    <Camera className="mr-2 size-4" aria-hidden="true" />
                    Use camera
                  </Button>
                  {file ? (
                    <Button type="button" variant="ghost" onClick={reset}>
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={analyze} disabled={busy} size="lg">
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  AI is examining your crop...
                </>
              ) : (
                "Analyze with AI"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              AI-generated assessment — not a definitive agricultural diagnosis.
            </p>
          </div>
        </section>

        {busy ? (
          <div
            role="status"
            aria-live="polite"
            className="surface-card mt-6 flex items-center gap-4 p-6"
          >
            <span className="gradient-leaf size-10 animate-pulse rounded-xl" aria-hidden="true" />
            <div>
              <p className="font-medium">AI is examining your crop...</p>
              <p className="text-sm text-muted-foreground">
                Checking for spots, lesions, discoloration, wilting and pest damage.
              </p>
            </div>
          </div>
        ) : null}

        {unclear ? (
          <div className="surface-card mt-6 flex items-start gap-3 p-6">
            <ImageOff className="mt-1 size-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Image not clear enough</h2>
              <p className="mt-1 text-sm text-muted-foreground">{unclear}</p>
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="mt-8">
            <DiagnosisReport result={result} imageUrl={preview} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={save} disabled={saving || saved}>
                {saved ? "Saved" : saving ? "Saving..." : "Save diagnosis"}
              </Button>
              <Button variant="outline" onClick={reset}>
                Analyze another image
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/history" search={{ q: undefined }}>
                  View history
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
                Go to dashboard
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
