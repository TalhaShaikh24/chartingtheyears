import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: 'Charting the Years',
    },
    tagline: {
      type: String,
      default: 'Interactive atlas of historical literature',
    },
    adminEmail: {
      type: String,
      required: true,
    },
    defaultLanguage: {
      type: String,
      default: 'English',
    },
    defaultEra: {
      type: String,
      default: '1900-1920',
    },
    booksPerPage: {
      type: Number,
      default: 20,
    },
    mapStyle: {
      type: String,
      default: 'Dark ocean',
    },
    // Display options
    displayTheme: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system',
    },
    fontFamily: {
      type: String,
      default: '',
    },
    fontScale: {
      type: Number,
      default: 1,
    },
    density: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
