import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Cover images are stored on disk (outside `public/` — Next.js only serves
// public/ assets that existed at build time) and served via /api/uploads/*.
// Override the location with UPLOADS_DIR when the production host mounts a
// persistent volume elsewhere.
export const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

const COVERS_DIR = path.join(UPLOADS_ROOT, 'covers');
const COVERS_URL_PREFIX = '/api/uploads/covers/';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

export function isBase64DataUrl(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('data:');
}

/** Write an image buffer to the uploads directory and return its public URL. */
export async function saveImageBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const ext = MIME_TO_EXT[mimeType.toLowerCase().split(';')[0].trim()] || 'jpg';
  await fs.mkdir(COVERS_DIR, { recursive: true });
  const fileName = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(COVERS_DIR, fileName), buffer);
  return `${COVERS_URL_PREFIX}${fileName}`;
}

/** Convert a `data:<mime>;base64,...` string to a stored file. Returns null if malformed. */
export async function saveDataUrlImage(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (!match) return null;
  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length === 0) return null;
  return saveImageBuffer(buffer, mimeType);
}

/** Delete a stored cover file. Ignores URLs that aren't managed uploads. */
export async function deleteStoredImage(url?: string | null): Promise<void> {
  if (!url || !url.startsWith(COVERS_URL_PREFIX)) return;
  // basename() strips any path traversal, so only files inside COVERS_DIR are reachable
  const fileName = path.basename(url);
  try {
    await fs.unlink(path.join(COVERS_DIR, fileName));
  } catch {
    // File already gone — nothing to do
  }
}
