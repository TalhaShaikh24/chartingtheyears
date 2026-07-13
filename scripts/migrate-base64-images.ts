import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: '.env.local' });

import Book from '../src/models/Book';
import { saveDataUrlImage } from '../src/lib/imageStorage';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB = process.env.MONGODB_DB || 'chartingtheyears';

// Converts every base64 imageUrl in the books collection into a file under
// ./uploads/covers (or UPLOADS_DIR) and stores the file URL in the document.
// Run from the project root: npx ts-node scripts/migrate-base64-images.ts
// Point MONGODB_URI at the production database to migrate production.
async function migrate() {
  try {
    console.log('[migrate] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log('[migrate] Connected');

    const total = await Book.countDocuments({ imageUrl: { $regex: '^data:' } });
    console.log(`[migrate] Found ${total} book(s) with base64 images`);

    let migrated = 0;
    let cleared = 0;

    const cursor = Book.find({ imageUrl: { $regex: '^data:' } })
      .select('_id title imageUrl')
      .cursor();

    for await (const book of cursor) {
      const fileUrl = await saveDataUrlImage(book.imageUrl);
      if (fileUrl) {
        await Book.updateOne({ _id: book._id }, { $set: { imageUrl: fileUrl } });
        migrated++;
        console.log(`[migrate] ${book.title} -> ${fileUrl}`);
      } else {
        await Book.updateOne({ _id: book._id }, { $set: { imageUrl: '' } });
        cleared++;
        console.warn(`[migrate] ${book.title} had a malformed data URL — imageUrl cleared`);
      }
    }

    console.log(`[migrate] Done. Migrated: ${migrated}, cleared malformed: ${cleared}`);
    process.exit(0);
  } catch (error) {
    console.error('[migrate] Error:', error);
    process.exit(1);
  }
}

migrate();
