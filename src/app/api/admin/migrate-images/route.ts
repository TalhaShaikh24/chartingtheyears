import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Book from '@/models/Book';
import { saveDataUrlImage } from '@/lib/imageStorage';
import { isAdminRequest } from '@/lib/apiAuth';

export const maxDuration = 300;

// One-off migration: converts every base64 `imageUrl` in the books collection
// into a file in the uploads directory and stores the file URL instead.
// Safe to run multiple times — it only touches documents that still hold base64.
// Run it on production by logging in as admin and visiting /api/admin/migrate-images.
async function runMigration(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    let migrated = 0;
    let cleared = 0;

    const cursor = Book.find({ imageUrl: { $regex: '^data:' } })
      .select('_id imageUrl')
      .cursor();

    for await (const book of cursor) {
      const fileUrl = await saveDataUrlImage(book.imageUrl);
      if (fileUrl) {
        await Book.updateOne({ _id: book._id }, { $set: { imageUrl: fileUrl } });
        migrated++;
      } else {
        // Malformed data URL — still remove the base64 blob from the document
        await Book.updateOne({ _id: book._id }, { $set: { imageUrl: '' } });
        cleared++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        migrated,
        clearedMalformed: cleared,
        remaining: await Book.countDocuments({ imageUrl: { $regex: '^data:' } }),
      },
    });
  } catch (error: any) {
    console.error('[v0] migrate-images error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return runMigration(request);
}

export async function POST(request: NextRequest) {
  return runMigration(request);
}
