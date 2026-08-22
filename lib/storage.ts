import 'server-only';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { put, del } from '@vercel/blob';

/**
 * Where uploaded files live.
 *
 * Two drivers, selected by whether a blob token is configured:
 *
 *  - `blob`: Vercel Blob. Required on Vercel, whose filesystem is read-only
 *              at runtime. Chosen whenever BLOB_READ_WRITE_TOKEN is present.
 *  - `local`, writes into `public/uploads`. Fine for development and for a
 *              self-hosted server with a persistent disk.
 *
 * Running on Vercel without a token fails loudly at the call site rather than
 * silently losing every upload to a read-only mount.
 */

export type StoredFile = {
  /** Driver-specific handle used to delete the file later. */
  key: string;
  /** Public URL the browser can load. */
  url: string;
};

export interface StorageDriver {
  readonly name: 'local' | 'blob';
  save(buffer: Buffer, ext: string, prefix: string): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

const localDriver: StorageDriver = {
  name: 'local',

  async save(buffer, ext, prefix) {
    const name = `${randomUUID()}.${ext}`;
    const dir = path.join(UPLOAD_ROOT, prefix);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buffer);

    return { key: `${prefix}/${name}`, url: `/uploads/${prefix}/${name}` };
  },

  async remove(key) {
    // Refuse anything that could escape the upload root.
    if (key.includes('..') || path.isAbsolute(key)) {
      throw new Error(`Refusing to delete suspicious key: ${key}`);
    }
    await unlink(path.join(UPLOAD_ROOT, key)).catch(() => {});
  },
};

const blobDriver: StorageDriver = {
  name: 'blob',

  async save(buffer, ext, prefix) {
    const pathname = `${prefix}/${randomUUID()}.${ext}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: `image/${ext}`,
      // The filename is already a UUID; a second suffix would make the key
      // unpredictable and harder to correlate with the database row.
      addRandomSuffix: false,
    });

    // Blob deletes are by URL, so that is the useful handle to keep.
    return { key: blob.url, url: blob.url };
  },

  async remove(key) {
    if (!key.startsWith('http')) {
      throw new Error(`Blob keys are URLs; refusing to delete: ${key}`);
    }
    await del(key);
  },
};

export function getStorage(): StorageDriver {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobDriver;

  if (process.env.VERCEL) {
    throw new Error(
      'Uploads are not configured: running on Vercel, whose filesystem is ' +
        'read-only, without BLOB_READ_WRITE_TOKEN. Create a Blob store and add ' +
        'the token to this environment.'
    );
  }

  return localDriver;
}

/**
 * Deleting a file stored by whichever driver wrote it. A record created before
 * a driver switch still carries the old handle, so route by its shape rather
 * than by the currently-selected driver.
 */
export async function removeStoredFile(key: string) {
  const driver = key.startsWith('http') ? blobDriver : localDriver;
  await driver.remove(key);
}
