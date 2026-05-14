import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SettingsSchema } from '@/lib/schemas';
import Settings from '@/models/Settings';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne().lean();

    if (!settings) {
      // Initialize default settings
      const defaultSettings = new Settings({
        siteName: 'Charting the Years',
        tagline: 'Interactive atlas of historical literature',
        adminEmail: 'ryan@historybookmap.com',
        defaultLanguage: 'English',
        defaultEra: '1900-1920',
        booksPerPage: 20,
        mapStyle: 'Dark Ocean',
        // Display options defaults (kept minimal for UI consistency)
      });

      settings = await defaultSettings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[v0] GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Log incoming payload for debugging
    console.log('[settings] PATCH payload:', body);

    // Validate with Zod - allow partial updates by using partial schema
    const validated = SettingsSchema.partial().parse(body);

    await connectDB();

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: validated },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[v0] PATCH /api/settings error:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
