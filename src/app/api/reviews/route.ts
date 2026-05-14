import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Book from '@/models/Book';
import { z } from 'zod';

const ReviewInputSchema = z.object({
  bookId: z.string().min(1, 'bookId is required'),
  author: z.string().min(1, 'Author is required').max(100),
  rating: z.number().min(1).max(5),
  text: z.string().min(1, 'Review text is required').max(2000),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const bookId = request.nextUrl.searchParams.get('bookId');
    if (!bookId) {
      return NextResponse.json(
        { success: false, error: 'bookId query param is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ bookId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('[v0] GET /api/reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ReviewInputSchema.parse(body);

    await connectDB();

    // Verify book exists
    const book = await Book.findById(validated.bookId).lean();
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    const review = new Review(validated);
    const saved = await review.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('[v0] POST /api/reviews error:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
