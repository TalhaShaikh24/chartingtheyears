import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signJwt } from '@/lib/auth';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate request body
    const result = signinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signJwt({ userId: user._id.toString(), role: user.role });

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: user.toJSON(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
