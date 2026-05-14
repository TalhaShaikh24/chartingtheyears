import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Book from '@/models/Book';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    await connectDB();

    const results = await Book.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('[v0] GET /api/books/search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
