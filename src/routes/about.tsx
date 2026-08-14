import { createFileRoute, Link } from "@tanstack/react-router";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { AI_DISCLAIMER } from "@/lib/crops";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AgriVision AI | Crop Disease Detection for Farmers" },
      {
        name: "description",
        content:
          "Learn how AgriVision AI analyses crop leaf photographs to surface likely diseases, symptoms and safe management steps for farmers and agricultural students.",
      },
      { property: "og:title", content: "About AgriVision AI" },
      {
        property: "og:description",
        content: "How AgriVision AI turns a crop leaf photo into a practical, structured crop-health assessment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About AgriVision AI</h1>
        <p className="mt-4 text-muted-foreground">
          AgriVision AI helps farmers and agricultural students spot likely crop problems early. Take a photo of
          an affected leaf, choose the crop, and receive a structured assessment describing the visible symptoms,
          practical management steps and prevention advice.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">How the assessment works</h2>
          <p className="text-muted-foreground">
            Your photograph is sent over a secure server-side connection to a vision model that reviews only what is
            visible in the image: spots, discoloration, lesions, wilting, mould-like patterns and pest damage. The
            model returns a machine-readable assessment with a confidence score, which the app translates into plain
            language.
          </p>
          <p className="text-muted-foreground">
            When the photo is unclear or the evidence is weak, AgriVision does not guess. It asks for a better photo
            instead of forcing a disease name.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Your data</h2>
          <p className="text-muted-foreground">
            Photos are stored in a private storage area and diagnoses are protected by row-level security, so only
            you can view or delete your own records. Analysis credentials stay on the server and are never exposed to
            the browser.
          </p>
        </section>

        <aside className="surface-card mt-10 p-5 text-sm text-muted-foreground">{AI_DISCLAIMER}</aside>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/analyze">Analyze a crop</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
