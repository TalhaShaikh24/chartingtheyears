import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookSchema } from '@/lib/schemas';
import Book from '@/models/Book';
import Category from '@/models/Category';
import Tag from '@/models/Tag';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const book = await Book.findById(id).lean();

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('[v0] GET /api/books/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validated = BookSchema.parse(body);

    await connectDB();
    const { id } = await params;

    const existingBook = await Book.findById(id).lean();
    if (!existingBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { ...validated, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    const previousTags = new Set(existingBook.tags || []);
    const nextTags = new Set(validated.tags || []);
    const removedTags = [...previousTags].filter((tag) => !nextTags.has(tag));
    const addedTags = [...nextTags].filter((tag) => !previousTags.has(tag));

    if (removedTags.length > 0) {
      for (const tag of removedTags) {
        await Tag.updateOne({ name: tag }, { $inc: { bookCount: -1 } });
      }
    }

    if (addedTags.length > 0) {
      for (const tag of addedTags) {
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

    if (existingBook.category !== validated.category) {
      await Category.updateOne(
        { name: existingBook.category },
        { $inc: { bookCount: -1 } }
      );

      await Category.updateOne(
        { name: validated.category },
        {
          $setOnInsert: { name: validated.category },
          $inc: { bookCount: 1 },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, data: updatedBook });
  } catch (error: any) {
    console.error('[v0] PATCH /api/books/[id] error:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const book = await Book.findById(id);

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Decrement tag counts
    if (book.tags && book.tags.length > 0) {
      for (const tag of book.tags) {
        await Tag.updateOne(
          { name: tag },
          { $inc: { bookCount: -1 } }
        );
      }
    }

    // Decrement category count
    await Category.updateOne(
      { name: book.category },
      { $inc: { bookCount: -1 } }
    );

    await Book.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('[v0] DELETE /api/books/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
