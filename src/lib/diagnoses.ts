/** Client-side data access for saved diagnoses (RLS scopes rows to the user). */
import { supabase } from "@/integrations/supabase/client";
import type { DiagnosisResult } from "./crops";

export type DiagnosisRow = {
  id: string;
  user_id: string;
  crop_type: string;
  image_url: string | null;
  diagnosis: string;
  confidence: number;
  severity: string;
  symptoms: string[];
  recommendations: string[];
  prevention: string[];
  created_at: string;
};

function toRow(record: Record<string, unknown>): DiagnosisRow {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  return {
    id: String(record["id"]),
    user_id: String(record["user_id"]),
    crop_type: String(record["crop_type"]),
    image_url: (record["image_url"] as string | null) ?? null,
    diagnosis: String(record["diagnosis"]),
    confidence: Number(record["confidence"]),
    severity: String(record["severity"]),
    symptoms: arr(record["symptoms"]),
    recommendations: arr(record["recommendations"]),
    prevention: arr(record["prevention"]),
    created_at: String(record["created_at"]),
  };
}

export async function listDiagnoses(): Promise<DiagnosisRow[]> {
  const { data, error } = await supabase
    .from("diagnoses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toRow(row as Record<string, unknown>));
}

export async function deleteDiagnosis(id: string) {
  const { error } = await supabase.from("diagnoses").delete().eq("id", id);
  if (error) throw error;
}

/** Uploads the photo to private storage and stores the structured assessment. */
export async function saveDiagnosis(result: DiagnosisResult, cropType: string, file: File | null) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("You need to be signed in to save a diagnosis.");

  let imagePath: string | null = null;
  if (file) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("crop-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    imagePath = path;
  }

  const { data, error } = await supabase
    .from("diagnoses")
    .insert({
      user_id: userId,
      crop_type: cropType,
      image_url: imagePath,
      diagnosis: result.diagnosis,
      confidence: result.confidence,
      severity: result.severity,
      symptoms: result.symptoms,
      recommendations: result.recommendations,
      prevention: result.prevention,
    })
    .select()
    .single();
  if (error) throw error;
  return toRow(data as Record<string, unknown>);
}

/** Creates a temporary signed URL for a stored crop photograph. */
export async function signedImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("crop-images").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
