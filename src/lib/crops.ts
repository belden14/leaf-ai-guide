/** Shared, client-safe domain constants and helpers for crop diagnoses. */

export const CROP_TYPES = [
  "Tomato",
  "Potato",
  "Maize",
  "Cassava",
  "Beans",
  "Banana",
  "Rice",
  "Wheat",
  "Other",
] as const;

export type CropType = (typeof CROP_TYPES)[number];

export const SEVERITIES = ["None", "Mild", "Moderate", "Severe", "Unknown"] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const AI_DISCLAIMER =
  "AI-generated assessment. Results should be confirmed by a qualified agricultural professional before making significant treatment decisions.";

export const AI_SHORT_DISCLAIMER =
  "AI-generated assessment — not a definitive agricultural diagnosis.";

export type DiagnosisResult = {
  crop: string;
  diagnosis: string;
  confidence: number; // 0..1
  severity: string;
  symptoms: string[];
  recommendations: string[];
  prevention: string[];
  /** True when the photo is too unclear to assess. */
  unclear?: boolean;
  message?: string;
};

/** Maps a 0..1 confidence into a labelled band used across the UI. */
export function confidenceBand(confidence: number): {
  label: string;
  tone: "high" | "moderate" | "low";
  hint?: string;
} {
  const pct = confidence * 100;
  if (pct >= 80) return { label: "High-confidence AI assessment", tone: "high" };
  if (pct >= 60) return { label: "Moderate-confidence AI assessment", tone: "moderate" };
  return {
    label: "Low-confidence assessment",
    tone: "low",
    hint: "Consider uploading another, clearer photograph of the affected plant part.",
  };
}

/** Validates a user-selected file before it is sent for analysis. */
export function validateImageFile(file: File | null): string | null {
  if (!file) return "Please select or capture an image of the crop leaf.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase()))
    return "Unsupported file type. Please upload a JPG, JPEG, PNG or WEBP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image is too large. Maximum size is 10 MB.";
  if (file.size < 1024) return "This image looks empty or corrupted. Please try another photo.";
  return null;
}

/** Formats a diagnosis into a coarse health status for dashboards. */
export function healthStatus(diagnosis: string, severity: string): "Healthy" | "Disease" | "High risk" {
  const healthy = /healthy|no disease|no visible/i.test(diagnosis);
  if (healthy) return "Healthy";
  if (/severe|high/i.test(severity)) return "High risk";
  return "Disease";
}
