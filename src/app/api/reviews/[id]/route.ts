import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import { verifyJwt } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyJwt(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('[reviews] DELETE /api/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
