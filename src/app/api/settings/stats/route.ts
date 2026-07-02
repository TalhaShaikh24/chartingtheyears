import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Book from '@/models/Book';
import Category from '@/models/Category';
import Tag from '@/models/Tag';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [totalBooks, totalCategories, totalTags, booksWithRating, countriesResult] =
      await Promise.all([
        Book.countDocuments(),
        Category.countDocuments(),
        Tag.countDocuments(),
        Book.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
        Book.aggregate([{ $group: { _id: '$country' } }, { $count: 'total' }]),
      ]);

    const averageRating = booksWithRating.length > 0 ? booksWithRating[0].avgRating : 0;
    const activeCountries = countriesResult.length > 0 ? countriesResult[0].total : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalBooks,
        totalCategories,
        totalTags,
        averageRating: parseFloat(averageRating.toFixed(1)),
        activeCountries,
      },
    });
  } catch (error) {
    console.error('[v0] GET /api/settings/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
