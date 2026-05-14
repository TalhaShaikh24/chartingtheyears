import mongoose from 'mongoose';

export interface IReadingList extends mongoose.Document {
  userId: string;   // stored as string to match JWT payload.userId directly
  bookIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReadingListSchema = new mongoose.Schema<IReadingList>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Delete cached model in development to pick up schema changes after hot-reload
if (process.env.NODE_ENV === 'development' && mongoose.models.ReadingList) {
  delete (mongoose.models as any).ReadingList;
}

export default mongoose.models.ReadingList ||
  mongoose.model<IReadingList>('ReadingList', ReadingListSchema);
