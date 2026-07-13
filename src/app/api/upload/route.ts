import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/apiAuth';
import { saveImageBuffer } from '@/lib/imageStorage';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported format. Use JPG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveImageBuffer(buffer, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('[v0] POST /api/upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
