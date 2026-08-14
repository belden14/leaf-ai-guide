/** Typed RPC boundary between the browser and the server-side AI integration. */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AnalyzeInput = z.object({
  cropType: z.string().min(1),
  imageDataUrl: z.string().startsWith("data:image/").max(15_000_000),
});

/** Analyses a crop photograph. Auth is required so usage is tied to a farmer. */
export const analyzeCrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const { analyzeCropImage } = await import("./ai.server");
    return analyzeCropImage({ imageDataUrl: data.imageDataUrl, cropType: data.cropType });
  });
