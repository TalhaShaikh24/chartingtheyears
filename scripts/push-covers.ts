import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Pushes locally stored cover files to a deployed environment so that the
// Book.imageUrl values in the shared database resolve there too.
//
// Usage (from the project root):
//   TARGET_URL=https://your-app.up.railway.app npm run push:covers
//
// Auth: set ADMIN_TOKEN to a valid admin JWT from the target environment
// (log in as admin there and copy the `token` cookie). If ADMIN_TOKEN is not
// set, the script signs one with the local JWT_SECRET — this only works when
// the target uses the same JWT_SECRET.

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB = process.env.MONGODB_DB || 'chartingtheyears';
const COVERS_DIR = path.join(process.cwd(), 'uploads', 'covers');

async function pushCovers() {
  const targetUrl = process.env.TARGET_URL?.replace(/\/$/, '');
  if (!targetUrl) {
    console.error('[push] TARGET_URL is required, e.g. TARGET_URL=https://your-app.up.railway.app');
    process.exit(1);
  }

  const token =
    process.env.ADMIN_TOKEN ||
    jwt.sign({ userId: 'push-covers-script', role: 'ADMIN' }, process.env.JWT_SECRET || '', {
      expiresIn: '1h',
    });

  try {
    console.log('[push] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });

    const books = await mongoose.connection
      .collection('books')
      .find({ imageUrl: { $regex: '^/api/uploads/covers/' } })
      .project({ imageUrl: 1 })
      .toArray();

    const fileNames = [...new Set(books.map((b) => path.basename(b.imageUrl as string)))];
    console.log(`[push] ${fileNames.length} cover file(s) referenced in the database`);

    let pushed = 0;
    let skipped = 0;
    let missing = 0;
    let failed = 0;

    for (const fileName of fileNames) {
      const filePath = path.join(COVERS_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`[push] MISSING locally: ${fileName}`);
        missing++;
        continue;
      }

      // Skip files the target already serves — makes the script resumable
      const check = await fetch(`${targetUrl}/api/uploads/covers/${fileName}`, { method: 'HEAD' });
      if (check.ok) {
        skipped++;
        continue;
      }

      const formData = new FormData();
      formData.append('file', new Blob([fs.readFileSync(filePath)]), fileName);

      const response = await fetch(`${targetUrl}/api/admin/restore-cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        pushed++;
        if (pushed % 25 === 0) console.log(`[push] ${pushed} pushed...`);
      } else {
        failed++;
        console.error(`[push] FAILED ${fileName}: ${response.status} ${await response.text()}`);
        if (response.status === 401) {
          console.error('[push] Unauthorized — set ADMIN_TOKEN to an admin JWT from the target environment.');
          process.exit(1);
        }
      }
    }

    console.log(
      `[push] Done. Pushed: ${pushed}, already on target: ${skipped}, missing locally: ${missing}, failed: ${failed}`
    );
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('[push] Error:', error);
    process.exit(1);
  }
}

pushCovers();
