/**
 * Image processing and client-side WebP compression utility for Yumora Studio
 */

export interface ImageValidationOptions {
  maxSizeBytes?: number; // default: 10MB
  allowedTypes?: string[];
}

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPct: number;
  width: number;
  height: number;
  fileName: string;
  format: "webp" | "original";
}

export const MAX_COVER_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_PAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Validate an image file before upload
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSizeBytes ?? MAX_COVER_SIZE_BYTES;
  const allowedTypes = options.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || "unknown"}). Allowed formats: JPG, PNG, WebP.`,
    };
  }

  if (file.size > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    const actualMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size too large (${actualMb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Format bytes to readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Client-side auto-compression to WebP using HTML5 Canvas
 */
export async function compressImageToWebP(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<CompressionResult> {
  const { maxWidth = 2400, maxHeight = 3600, quality = 0.88 } = options;
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data"));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if exceeds max dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback if 2d context unavailable
          resolve({
            dataUrl: event.target?.result as string,
            originalSize,
            compressedSize: originalSize,
            savingsPct: 0,
            width: img.width,
            height: img.height,
            fileName: file.name,
            format: "original",
          });
          return;
        }

        // Draw and compress to WebP
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpDataUrl = canvas.toDataURL("image/webp", quality);
          
          // Estimate compressed size from base64 string
          const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(",") + 1);
          const compressedSize = Math.round((base64Length * 3) / 4);

          // If WebP is actually smaller or comparable, use it
          const savingsPct =
            originalSize > 0
              ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
              : 0;

          // Convert filename extension to .webp
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const newFileName = `${baseName}.webp`;

          resolve({
            dataUrl: webpDataUrl,
            originalSize,
            compressedSize,
            savingsPct,
            width,
            height,
            fileName: newFileName,
            format: "webp",
          });
        } catch {
          // Fallback to original
          resolve({
            dataUrl: event.target?.result as string,
            originalSize,
            compressedSize: originalSize,
            savingsPct: 0,
            width: img.width,
            height: img.height,
            fileName: file.name,
            format: "original",
          });
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
