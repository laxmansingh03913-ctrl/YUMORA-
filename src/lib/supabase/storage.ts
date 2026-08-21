import { supabase } from "./client";

export const SUPABASE_BUCKETS = {
  COVERS: "covers",
  COMICS: "comics",
  MANUSCRIPTS: "manuscripts",
  AVATARS: "avatars",
};

/**
 * Helper to convert Base64 Data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/webp";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload a file or blob to Supabase Storage bucket
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/webp",
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

/**
 * Direct upload of Base64 Data URL to Supabase Storage
 */
export async function uploadDataUrlToSupabase(
  bucket: string,
  path: string,
  dataUrl: string
): Promise<string> {
  // If it's already an HTTP / CDN url, return as is
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const result = await uploadToSupabaseStorage(bucket, path, blob);
    if (result.url) {
      return result.url;
    }
  } catch (err) {
    console.warn("Upload Data URL to Supabase failed:", err);
  }
  return dataUrl;
}
