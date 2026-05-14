import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: '.env.local' });

import Book from '../src/models/Book';
import Category from '../src/models/Category';
import Tag from '../src/models/Tag';
import Settings from '../src/models/Settings';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB = process.env.MONGODB_DB || 'chartingtheyears';

const sampleBooks = [
  {
    title: 'Sister Carrie',
    author: 'Theodore Dreiser',
    historicalYear: 1900,
    publicationYear: 1900,
    country: 'US',
    category: 'Social History',
    language: 'English',
    rating: 5,
    type: 'Fiction',
    status: 'published',
    tags: ['urban', 'realism', 'ambition'],
    reviewText: 'A groundbreaking novel of American realism.',
  },
  {
    title: 'The Call of the Wild',
    author: 'Jack London',
    historicalYear: 1903,
    publicationYear: 1903,
    country: 'US',
    category: 'General History',
    language: 'English',
    rating: 5,
    type: 'Fiction',
    status: 'published',
    tags: ['adventure', 'nature', 'survival'],
    reviewText: 'The classic tale of survival in the Yukon.',
  },
  {
    title: 'The Jungle',
    author: 'Upton Sinclair',
    historicalYear: 1906,
    publicationYear: 1906,
    country: 'US',
    category: 'Economic History',
    language: 'English',
    rating: 4,
    type: 'Fiction',
    status: 'published',
    tags: ['industry', 'labor', 'socialism'],
    reviewText: 'An exposé of the American meatpacking industry.',
  },
  {
    title: 'Up From Slavery',
    author: 'Booker T. Washington',
    historicalYear: 1901,
    publicationYear: 1901,
    country: 'US',
    category: 'Political History',
    language: 'English',
    rating: 4,
    type: 'Non-fiction',
    status: 'published',
    tags: ['biography', 'education', 'equality'],
    reviewText: 'The autobiography of one of the most influential African American leaders.',
  },
  {
    title: 'The House of Mirth',
    author: 'Edith Wharton',
    historicalYear: 1905,
    publicationYear: 1905,
    country: 'US',
    category: 'Social History',
    language: 'English',
    rating: 4,
    type: 'Fiction',
    status: 'published',
    tags: ['society', 'tragedy', 'New York'],
    reviewText: 'A cutting critique of New York high society.',
  },
  {
    title: 'My Ántonia',
    author: 'Willa Cather',
    historicalYear: 1918,
    publicationYear: 1918,
    country: 'US',
    category: 'Social History',
    language: 'English',
    rating: 4,
    type: 'Fiction',
    status: 'published',
    tags: ['pioneer', 'prairie', 'immigrant'],
    reviewText: 'A lyrical portrait of life on the American prairie.',
  },
];

const sampleCategories = [
  { name: 'General History', bookCount: 0 },
  { name: 'Military History', bookCount: 0 },
  { name: 'Political History', bookCount: 0 },
  { name: 'Social History', bookCount: 0 },
  { name: 'Economic History', bookCount: 0 },
  { name: 'Cultural History', bookCount: 0 },
];

const sampleTags = [
  { name: 'diplomatic', bookCount: 0 },
  { name: 'empire', bookCount: 0 },
  { name: 'war', bookCount: 0 },
  { name: 'military', bookCount: 0 },
  { name: 'democracy', bookCount: 0 },
  { name: 'trade', bookCount: 0 },
  { name: 'economic', bookCount: 0 },
  { name: 'maritime', bookCount: 0 },
  { name: 'Paris', bookCount: 0 },
];

const defaultSettings = {
  siteName: 'Charting the Years',
  tagline: 'Interactive atlas of historical literature',
  adminEmail: 'ryan@historybookmap.com',
  defaultLanguage: 'English',
  defaultEra: '1900-1920',
  booksPerPage: 20,
  mapStyle: 'Dark ocean',
};

async function seed() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log('[v0] Connected to MongoDB');

    // Clear existing data
    console.log('[v0] Clearing existing collections...');
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});
    await Settings.deleteMany({});

    // Seed categories
    console.log('[v0] Seeding categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`[v0] Created ${createdCategories.length} categories`);

    // Seed tags
    console.log('[v0] Seeding tags...');
    const createdTags = await Tag.insertMany(sampleTags);
    console.log(`[v0] Created ${createdTags.length} tags`);

    // Seed books and update counts
    console.log('[v0] Seeding books...');
    for (const bookData of sampleBooks) {
      const book = new Book(bookData);
      await book.save();

      // Update category count
      await Category.updateOne(
        { name: bookData.category },
        { $inc: { bookCount: 1 } }
      );

      // Update tag counts
      for (const tag of bookData.tags) {
        await Tag.updateOne(
          { name: tag },
          { $inc: { bookCount: 1 } }
        );
      }
    }
    console.log(`[v0] Created ${sampleBooks.length} books`);

    // Seed settings
    console.log('[v0] Seeding settings...');
    await Settings.create(defaultSettings);
    console.log('[v0] Created default settings');

    console.log('[v0] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error seeding database:', error);
    process.exit(1);
  }
}

seed();
