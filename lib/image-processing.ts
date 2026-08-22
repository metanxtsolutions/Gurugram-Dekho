import 'server-only';
import sharp, { type Metadata } from 'sharp';

/**
 * Validation and normalisation for files arriving from the public internet.
 *
 * Three things matter here:
 *  - the file must really be an image, checked by decoding it rather than by
 *    trusting a Content-Type header or a file extension;
 *  - EXIF must be stripped, because phone photos carry GPS coordinates and
 *    device identifiers that the submitter did not intend to publish;
 *  - the output must be bounded, so one upload cannot fill the disk.
 */

/**
 * Vercel caps a serverless request body at 4.5 MB and rejects anything larger
 * before our handler runs, which would surface as an opaque platform error.
 * Staying under that keeps the failure ours, with a message worth reading.
 * The browser downscales before upload, so this is rarely the binding limit.
 */
export const MAX_UPLOAD_BYTES = process.env.VERCEL
  ? 4 * 1024 * 1024 // 4 MB
  : 8 * 1024 * 1024; // 8 MB

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
const MAX_DIMENSION = 2000;
const MIN_DIMENSION = 400;
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp', 'avif'];

export type ProcessedImage = {
  buffer: Buffer;
  ext: 'webp';
  width: number;
  height: number;
  bytes: number;
};

export type ProcessResult =
  | { ok: true; image: ProcessedImage }
  | { ok: false; error: string };

export async function processUpload(input: Buffer): Promise<ProcessResult> {
  if (input.byteLength === 0) return { ok: false, error: 'The file is empty' };
  if (input.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `Image must be ${MAX_UPLOAD_MB} MB or smaller` };
  }

  let meta: Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    // Decoding failed, whatever this is, it is not an image.
    return { ok: false, error: 'That file is not a readable image' };
  }

  if (!meta.format || !ALLOWED_FORMATS.includes(meta.format)) {
    return { ok: false, error: 'Use a JPEG, PNG, WebP or AVIF image' };
  }
  if (!meta.width || !meta.height) {
    return { ok: false, error: 'Could not read the image dimensions' };
  }
  if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
    return {
      ok: false,
      error: `Image is too small. Use at least ${MIN_DIMENSION}px on each side`,
    };
  }

  // Re-encoding through sharp drops every metadata chunk, EXIF included.
  const pipeline = sharp(input, { failOn: 'error' })
    .rotate() // apply EXIF orientation before that data is discarded
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    ok: true,
    image: {
      buffer: data,
      ext: 'webp',
      width: info.width,
      height: info.height,
      bytes: data.byteLength,
    },
  };
}
