import { z } from 'zod';

// Book Schema
export const BookSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  historicalYear: z.number().min(1000).max(3000),
  publicationYear: z.number().min(1000).max(3000),
  country: z.string().min(1, 'Country is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.string().min(1, 'Language is required'),
  rating: z.number().min(1).max(5),
  type: z.string().min(1, 'Type is required'),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()),
  reviewText: z.string().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Book = z.infer<typeof BookSchema>;

// Category Schema
export const CategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  bookCount: z.number().default(0),
});

export type Category = z.infer<typeof CategorySchema>;

// Tag Schema
export const TagSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Tag name is required'),
  bookCount: z.number().default(0),
});

export type Tag = z.infer<typeof TagSchema>;

// Settings Schema
export const SettingsSchema = z.object({
  _id: z.string().optional(),
  siteName: z.string().min(1, 'Site name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  adminEmail: z.string().email('Valid email is required'),
  defaultLanguage: z.string().default('English'),
  defaultEra: z.string().default('1900-1920'),
  booksPerPage: z.number().default(20),
  mapStyle: z.string().default('Parchment'),
  displayTheme: z.enum(['system', 'light', 'dark']).default('system'),
  fontFamily: z.string().optional(),
  fontScale: z.number().min(0.75).max(1.5).default(1),
  density: z.number().min(0.75).max(1.5).default(1),
});

export type Settings = z.infer<typeof SettingsSchema>;

// Database Stats Schema
export const StatsSchema = z.object({
  totalBooks: z.number(),
  totalCategories: z.number(),
  totalTags: z.number(),
  averageRating: z.number(),
  activeCountries: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;
