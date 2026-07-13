import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_ROOT, EXT_TO_MIME } from '@/lib/imageStorage';

// Streams files from the uploads directory. Files live outside `public/`
// because Next.js only serves public/ assets present at build time.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const filePath = path.resolve(UPLOADS_ROOT, ...segments);

    // Guard against path traversal — the resolved path must stay inside UPLOADS_ROOT
    if (!filePath.startsWith(path.resolve(UPLOADS_ROOT) + path.sep)) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = EXT_TO_MIME[ext] || 'application/octet-stream';

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
}
