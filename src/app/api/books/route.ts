import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookSchema } from '@/lib/schemas';
import Book from '@/models/Book';
import Category from '@/models/Category';
import Tag from '@/models/Tag';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status');

    const filter = status ? { status } : {};

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Book.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: books,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('[v0] GET /api/books error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validated = BookSchema.parse(body);

    await connectDB();

    // Create new book
    const newBook = new Book(validated);
    const savedBook = await newBook.save();

    // Update tags counts
    if (validated.tags.length > 0) {
      for (const tag of validated.tags) {
        await Tag.updateOne(
          { name: tag },
          {
            $setOnInsert: { name: tag },
            $inc: { bookCount: 1 },
          },
          { upsert: true }
        );
      }
    }

    // Update category count
    await Category.updateOne(
      { name: validated.category },
      {
        $setOnInsert: { name: validated.category },
        $inc: { bookCount: 1 },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: savedBook,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] POST /api/books error:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create book', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
