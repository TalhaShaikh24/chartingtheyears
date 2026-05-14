import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config({ path: '.env.local' });

import User from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB = process.env.MONGODB_DB || 'chartingtheyears';

async function seedAdmin() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log('[v0] Connected to MongoDB');

    const email = 'admin@example.com';
    const password = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`[v0] Admin user ${email} already exists!`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: 'System Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
    });

    console.log(`[v0] Admin user created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
