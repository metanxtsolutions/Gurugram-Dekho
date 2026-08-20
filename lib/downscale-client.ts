'use client';

/**
 * Shrink a photo in the browser before uploading.
 *
 * Phone photos routinely exceed the request-body limit of a serverless
 * function, so without this a perfectly good submission fails at the platform
 * edge with nothing useful to show the user. Re-encoding through a canvas also
 * drops EXIF — but the server strips it again with sharp, because nothing the
 * client claims about a file can be trusted.
 */

const MAX_EDGE = 2000;
const QUALITY = 0.85;

export async function downscaleImage(file: File): Promise<File> {
  // Anything already small enough goes through untouched.
  if (file.size <= 1_000_000) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Not decodable here — let the server produce the real error message.
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY)
  );

  // Keep the original if the re-encode somehow came out larger.
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
