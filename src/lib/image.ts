/**
 * Client-side image downscaling before upload.
 * Shrinks large phone photos (often 3–10MB) to a web-friendly JPEG so they
 * pass the 5MB Storage rule and take less storage/bandwidth.
 */

interface ResizeOptions {
  /** Max width/height in px (longest side). */
  maxDimension?: number;
  /** JPEG quality 0–1. */
  quality?: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

export async function resizeImage(
  file: File,
  { maxDimension = 1600, quality = 0.85 }: ResizeOptions = {}
): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file;

  try {
    // Browsers apply EXIF orientation when decoding into <img>, so phone photos stay upright.
    const img = await loadImage(file);
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return file;

    const scale = Math.min(1, maxDimension / Math.max(w, h));
    const width = Math.round(w * scale);
    const height = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // White background so transparent PNGs don't turn black as JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) return file;

    // Keep the original if it was already small and re-encoding didn't help.
    if (scale === 1 && blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]*$/, '') || 'image';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.warn('[resizeImage] Falling back to original file:', err);
    return file;
  }
}
