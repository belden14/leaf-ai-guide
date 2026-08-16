/**
 * Server-only AI vision integration.
 *
 * The model/provider is isolated here so it can be swapped without touching the
 * frontend: the frontend only ever sees the structured `DiagnosisResult` shape.
 * Credentials come from environment variables and never reach the browser.
 */
import type { DiagnosisResult } from "./crops";

const AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const AI_MODEL = "google/gemini-3.5-flash";

const SYSTEM_PROMPT = `You are AgriVision, an agricultural crop-health assistant that reviews photographs of crop plants.

Rules you must follow:
- Analyse ONLY visible evidence in the photograph (spots, discoloration, lesions, wilting, mould-like growth, pest damage, deformation).
- Never invent information you cannot see (soil chemistry, weather history, lab results).
- Identify the single most likely disease or disorder only when the visible evidence supports it.
- Provide an honest confidence value between 0 and 1. Do not inflate confidence.
- If the image is blurry, too dark, not a plant, or shows no usable detail, set "unclear" to true, set confidence below 0.4 and set diagnosis to "Unable to confidently analyse".
- If the plant looks healthy, say so instead of forcing a disease.
- Recommendations must be general, safe cultural/management practices (sanitation, spacing, irrigation practice, crop rotation, scouting). Do NOT give specific chemical products, dosages or mixing instructions.
- Always recommend confirmation by a qualified agricultural professional or extension officer when treatment decisions matter.
- Respond with STRICT JSON only, no markdown, matching this shape:
{"crop":string,"diagnosis":string,"confidence":number,"severity":"None"|"Mild"|"Moderate"|"Severe"|"Unknown","symptoms":string[],"recommendations":string[],"prevention":string[],"unclear":boolean,"message":string}`;

export type AnalyzeArgs = {
  /** Data URL (data:image/...;base64,...) of the crop photograph. */
  imageDataUrl: string;
  cropType: string;
};

/** Calls the AI vision provider and returns a validated, structured diagnosis. */
export async function analyzeCropImage({ imageDataUrl, cropType }: AnalyzeArgs): Promise<DiagnosisResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI service is not configured.");

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `The farmer says this crop is: ${cropType}. Assess the plant health from this photograph and return the JSON object.`,
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (response.status === 429) throw new Error("AI service is busy right now. Please try again in a moment.");
  if (response.status === 402) throw new Error("AI credits are exhausted. Please top up to continue analysing.");
  if (!response.ok) {
    const detail = await response.text();
    console.error("AI gateway error", response.status, detail);
    throw new Error("The AI service could not analyse this image. Please try again.");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  return normalise(raw, cropType);
}

/** Parses and defensively normalises the model output into our contract. */
function normalise(raw: string, cropType: string): DiagnosisResult {
  const jsonText = raw.replace(/```json|```/g, "").trim();
  let parsed: Record<string, unknown> = {};
  try {
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    parsed = JSON.parse(start >= 0 ? jsonText.slice(start, end + 1) : jsonText) as Record<string, unknown>;
  } catch {
    return {
      crop: cropType,
      diagnosis: "Unable to confidently analyse",
      confidence: 0,
      severity: "Unknown",
      symptoms: [],
      recommendations: [],
      prevention: [],
      unclear: true,
      message:
        "Unable to confidently analyze this image. Please upload a clear photograph showing the affected part of the plant.",
    };
  }

  const list = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 8) : [];

  let confidence = typeof parsed["confidence"] === "number" ? (parsed["confidence"] as number) : 0;
  if (confidence > 1) confidence = confidence / 100;
  confidence = Math.max(0, Math.min(1, confidence));

  const unclear = parsed["unclear"] === true || confidence < 0.4;

  return {
    crop: typeof parsed["crop"] === "string" && parsed["crop"] ? (parsed["crop"] as string) : cropType,
    diagnosis: unclear
      ? "Unable to confidently analyse"
      : ((parsed["diagnosis"] as string) ?? "Unable to confidently analyse"),
    confidence,
    severity: typeof parsed["severity"] === "string" ? (parsed["severity"] as string) : "Unknown",
    symptoms: list(parsed["symptoms"]),
    recommendations: list(parsed["recommendations"]),
    prevention: list(parsed["prevention"]),
    unclear,
    message: unclear
      ? "Unable to confidently analyze this image. Please upload a clear photograph showing the affected part of the plant."
      : ((parsed["message"] as string) ?? ""),
  };
}

const ADVISOR_PROMPT = `You are AgriVision Assistant, a friendly agricultural extension advisor helping smallholder farmers and agriculture students.

Rules:
- Answer in clear, simple language. Short paragraphs or short bullet lists.
- Cover practical crop management: planting, irrigation, soil health, pests, diseases, harvesting, storage and how to use this app.
- Give general, safe cultural and integrated pest management advice. Never give specific pesticide products, dosages or mixing instructions.
- Recommend confirmation by a local agricultural extension officer for significant treatment decisions.
- Say plainly when you do not know something, and never invent local prices, laws or lab results.
- Keep answers under about 180 words unless the farmer asks for more detail.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Conversational advisor used by the in-app chatbot. */
export async function chatWithAdvisor(messages: ChatMessage[]): Promise<{ reply: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI service is not configured.");

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "system", content: ADVISOR_PROMPT }, ...messages],
    }),
  });

  if (response.status === 429) throw new Error("The assistant is busy right now. Please try again in a moment.");
  if (response.status === 402) throw new Error("AI credits are exhausted. Please top up to continue.");
  if (!response.ok) {
    console.error("AI gateway chat error", response.status, await response.text());
    throw new Error("The assistant could not answer right now. Please try again.");
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { reply: payload.choices?.[0]?.message?.content?.trim() || "Sorry, I could not answer that." };
}
