import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import ReadingList from '@/models/ReadingList';

/** PUT /api/reading-list/merge — merge guest localStorage IDs into the user's DB list */
export async function PUT(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyJwt(authHeader.split(' ')[1]);
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookIds } = await req.json();
    if (!Array.isArray(bookIds)) {
      return NextResponse.json({ success: false, message: 'bookIds must be an array' }, { status: 400 });
    }

    // Filter to valid non-empty strings
    const validIds = bookIds.filter((id): id is string => typeof id === 'string' && id.trim() !== '');
    if (validIds.length === 0) {
      // Nothing to merge — just return current list
      await connectDB();
      const doc = await ReadingList.findOne({ userId: payload.userId }).lean();
      return NextResponse.json({ success: true, data: { bookIds: doc?.bookIds ?? [] } });
    }

    await connectDB();
    // $addToSet with $each handles deduplication automatically
    const doc = await ReadingList.findOneAndUpdate(
      { userId: payload.userId },
      { $addToSet: { bookIds: { $each: validIds } } },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, data: { bookIds: doc.bookIds } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
