import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/apiAuth';
import { saveNamedImage } from '@/lib/imageStorage';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Restores a cover file under its exact name so existing Book.imageUrl values
// keep resolving. Used by scripts/push-covers.ts to sync locally migrated
// covers up to production. Idempotent: re-uploading a file overwrites it.
export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.name) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveNamedImage(buffer, file.name);

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Invalid file name or extension.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('[v0] POST /api/admin/restore-cover error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore cover' },
      { status: 500 }
    );
  }
}
