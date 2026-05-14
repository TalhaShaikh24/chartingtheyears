import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Tag from '@/models/Tag';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const tags = await Tag.find({})
      .sort({ bookCount: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('[v0] GET /api/tags error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existingTag) {
      return NextResponse.json(
        { success: false, error: 'Tag already exists' },
        { status: 409 }
      );
    }

    const tag = new Tag({
      name: name.trim(),
    });

    await tag.save();

    return NextResponse.json(
      {
        success: true,
        data: tag,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] POST /api/tags error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
