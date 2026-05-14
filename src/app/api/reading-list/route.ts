import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import ReadingList from '@/models/ReadingList';

/** Extract and verify the Bearer token from request headers */
function getTokenPayload(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return verifyJwt(authHeader.split(' ')[1]);
  } catch (e) {
    console.error('[reading-list] Token verification failed:', e);
    return null;
  }
}

/** GET /api/reading-list — fetch the authenticated user's book IDs */
export async function GET(req: Request) {
  const payload = getTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const doc = await ReadingList.findOne({ userId: payload.userId }).lean();
    return NextResponse.json({
      success: true,
      data: { bookIds: doc?.bookIds ?? [] },
    });
  } catch (error: any) {
    console.error('[reading-list] GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/** POST /api/reading-list — add a bookId to the user's list */
export async function POST(req: Request) {
  const payload = getTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookId } = await req.json();
    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json({ success: false, message: 'bookId is required' }, { status: 400 });
    }

    await connectDB();

    // Use $addToSet to prevent duplicates; findOneAndUpdate with upsert creates document if missing
    const doc = await ReadingList.findOneAndUpdate(
      { userId: payload.userId },
      { $addToSet: { bookIds: bookId } },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, data: { bookIds: doc.bookIds } });
  } catch (error: any) {
    console.error('[reading-list] POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/reading-list — remove a bookId from the user's list */
export async function DELETE(req: Request) {
  const payload = getTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookId } = await req.json();
    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json({ success: false, message: 'bookId is required' }, { status: 400 });
    }

    await connectDB();
    const doc = await ReadingList.findOneAndUpdate(
      { userId: payload.userId },
      { $pull: { bookIds: bookId } },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      data: { bookIds: doc?.bookIds ?? [] },
    });
  } catch (error: any) {
    console.error('[reading-list] DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
