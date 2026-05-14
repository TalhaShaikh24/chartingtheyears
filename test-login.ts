import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB = process.env.MONGODB_DB || 'chartingtheyears';

async function test() {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  const user = await User.findOne({ email: 'admin@example.com' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  console.log('User found:', user.name, user.email, user.role);
  const isMatch = await bcrypt.compare('Admin@123', user.password || '');
  console.log('Password match:', isMatch);
  process.exit(0);
}

test();
