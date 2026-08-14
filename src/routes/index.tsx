import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ScanLine, Sprout, ShieldCheck, LineChart, Leaf, Clock, WifiOff } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { CROP_TYPES, AI_SHORT_DISCLAIMER } from "@/lib/crops";
import heroImage from "@/assets/hero-field.jpg";
import leafImage from "@/assets/leaf-closeup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriVision AI | Detect Crop Diseases from a Leaf Photo" },
      {
        name: "description",
        content:
          "Upload a photo of a crop leaf and get an AI-powered crop health assessment with likely disease, symptoms, treatment and prevention guidance.",
      },
      { property: "og:title", content: "AgriVision AI – Crop Disease Detector" },
      {
        property: "og:description",
        content: "AI crop-health assessments from a single leaf photograph, built for farmers and agri students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: Camera, title: "Photograph the leaf", text: "Capture or upload a clear photo of the affected plant part." },
  { icon: Sprout, title: "Choose your crop", text: "Pick from tomato, maize, cassava, rice and more." },
  { icon: ScanLine, title: "Run the AI analysis", text: "Visible symptoms are reviewed in seconds, securely." },
  { icon: ShieldCheck, title: "Act with confidence", text: "Get symptoms, management steps and prevention advice." },
];

const BENEFITS = [
  { icon: Clock, title: "Answers in seconds", text: "No waiting for a field visit to know what you may be facing." },
  { icon: LineChart, title: "Track crop health", text: "Every saved diagnosis builds a picture of your farm over time." },
  { icon: ShieldCheck, title: "Honest confidence", text: "Low-confidence results say so instead of guessing a disease." },
  { icon: WifiOff, title: "Works on any phone", text: "Mobile-first interface designed for use out in the field." },
];

function Landing() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <NavBar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-secondary/30">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Leaf className="size-3.5 text-primary" aria-hidden="true" />
                AI crop-health assistant
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Detect Crop Diseases with <span className="text-gradient-leaf">AI</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Upload a photo of a crop leaf and get an AI-powered assessment, possible disease identification, and
                practical recommendations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/analyze">Analyze a Crop</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">{AI_SHORT_DISCLAIMER}</p>
            </div>

            <img
              src={heroImage}
              alt="Farmer photographing a tomato plant leaf with a smartphone in a green field"
              width={1600}
              height={1104}
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="how">
          <h2 id="how" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="surface-card p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Supported crops */}
        <section className="border-y border-border bg-secondary/30 py-16" aria-labelledby="crops">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="crops" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Supported crops
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Staple and cash crops grown across smallholder and commercial farms.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {CROP_TYPES.map((crop) => (
                <li
                  key={crop}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {crop}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="benefits">
          <h2 id="benefits" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Benefits
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <article key={b.title} className="surface-card p-6">
                <b.icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* AI analysis */}
        <section className="border-y border-border bg-secondary/30 py-16" aria-labelledby="ai">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <img
              src={leafImage}
              alt="Close-up of a crop leaf showing dark circular lesions and yellowing tissue"
              width={1200}
              height={900}
              loading="lazy"
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
            />
            <div>
              <h2 id="ai" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                AI analysis grounded in what is visible
              </h2>
              <p className="mt-4 text-muted-foreground">
                The model reviews spots, discoloration, lesions, wilting, mould-like patterns and pest damage — and
                reports only what the photograph supports. Every result carries a confidence score, a severity rating
                and safe, general management guidance.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>• Structured, machine-readable results</li>
                <li>• Asks for a clearer photo instead of guessing</li>
                <li>• No specific chemical dosing instructions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Farmer dashboard */}
        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="dash">
          <h2 id="dash" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Farmer dashboard
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Save every assessment and watch patterns emerge: diagnoses over time, the diseases showing up most often,
            and the overall health distribution of your crops.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              ["Total analyses", "Every photo you have assessed"],
              ["Disease frequency", "Which problems keep coming back"],
              ["High-risk cases", "Severe findings that need attention"],
            ].map(([title, text]) => (
              <div key={title} className="surface-card p-6">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="gradient-leaf rounded-3xl px-6 py-14 text-center text-primary-foreground">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Know what is affecting your crop</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">
              One photo is all it takes to get a structured crop-health assessment and a practical plan of action.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/analyze">Analyze a Crop</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <p className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          AgriVision AI — {AI_SHORT_DISCLAIMER}
        </p>
      </footer>
    </div>
  );
}
