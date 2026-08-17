import { supabase } from "./client";

export const SUPABASE_BUCKETS = {
  COVERS: "covers",
  COMICS: "comics",
  MANUSCRIPTS: "manuscripts",
  AVATARS: "avatars",
};

/**
 * Upload a file to Supabase Storage bucket
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });

    if (error) {
      console.warn("Supabase storage upload notice:", error.message);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload error";
    return { url: null, error: message };
  }
}
