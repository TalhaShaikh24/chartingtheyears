# Mongoose Integration - Setup Guide

## Overview

The project has been successfully refactored to use **Mongoose** as the ODM (Object Document Mapper) for MongoDB. Mongoose provides:
- Schema validation and type safety
- Model-based approach (cleaner than raw MongoDB client)
- Built-in hooks and middleware
- Better query building and aggregation

## Architecture Changes

### Before (Native MongoDB Driver)
```typescript
import { MongoClient } from 'mongodb';
const db = await getDatabase();
const collection = db.collection('books');
const result = await collection.findOne({ _id: ObjectId });
```

### After (Mongoose)
```typescript
import Book from '@/models/Book';
const book = await Book.findById(id);
```

## Key Files

### Database Connection
- **`src/lib/db.ts`** - Mongoose connection setup with caching for serverless environments

### Models (Schemas)
- **`src/models/Book.ts`** - Book schema with validation
- **`src/models/Category.ts`** - Category schema
- **`src/models/Tag.ts`** - Tag schema
- **`src/models/Settings.ts`** - Settings schema

### API Routes (Updated to use Mongoose)
- **`src/app/api/books/route.ts`** - GET all books, POST new book
- **`src/app/api/books/[id]/route.ts`** - GET, PATCH, DELETE single book
- **`src/app/api/books/search/route.ts`** - Search books by title/author/category
- **`src/app/api/categories/route.ts`** - GET all categories
- **`src/app/api/tags/route.ts`** - GET all tags
- **`src/app/api/settings/route.ts`** - GET/PATCH settings
- **`src/app/api/settings/stats/route.ts`** - Database statistics

## Getting Started

### 1. Set MongoDB URI
Add your MongoDB connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chartingtheyears
```

For local development:
```env
MONGODB_URI=mongodb://localhost:27017/chartingtheyears
```

### 2. Seed the Database

Once MongoDB is connected, populate the database with sample data:

```bash
pnpm run seed
```

This will create:
- 5 sample books
- 6 categories
- 9 tags
- 1 settings document

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000/admin/dashboard`

## API Endpoints

### Books
- `GET /api/books?limit=20&skip=0&status=published` - List books with pagination and filtering
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book
- `PATCH /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/search?q=query` - Search books

### Categories
- `GET /api/categories` - List all categories

### Tags
- `GET /api/tags` - List all tags

### Settings
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings
- `GET /api/settings/stats` - Get database statistics

## Mongoose Features Used

### Schema Validation
```typescript
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  status: { enum: ['draft', 'published'], default: 'draft' },
  tags: { type: [String], default: [] },
}, { timestamps: true });
```

### Lean Queries (Performance)
```typescript
// .lean() returns plain JavaScript objects instead of Mongoose documents
// Faster for read-only operations
const books = await Book.find({}).lean();
```

### Aggregation Pipeline
```typescript
const stats = await Book.aggregate([
  { $group: { _id: null, avgRating: { $avg: '$rating' } } }
]);
```

### Upsert Operations
```typescript
await Category.updateOne(
  { name: validated.category },
  { $setOnInsert: { name: validated.category, bookCount: 0 }, $inc: { bookCount: 1 } },
  { upsert: true }
);
```

## Benefits Over Native MongoDB Driver

| Feature | Native Driver | Mongoose |
|---------|--------------|----------|
| Schema Definition | Manual validation | Built-in schemas |
| Type Safety | Basic | Full TypeScript support |
| Querying | Verbose | Cleaner syntax |
| Relationships | Manual | Populate support |
| Middleware | Manual | Built-in hooks |
| Caching | Manual | Lean queries |
| Community | Large | Very large |

## Troubleshooting

### MongoDB Connection Error
```
Error: Please add your Mongo URI to .env.local
```
**Solution:** Add `MONGODB_URI` to `.env.local`

### Model Not Found
```
TypeError: Cannot read property 'findById' of undefined
```
**Solution:** Ensure models are properly exported from `src/models/*.ts`

### Validation Errors
The API returns validation errors from both Zod (client-side) and Mongoose (server-side):
```json
{
  "success": false,
  "error": "Validation error",
  "details": { "field": ["error message"] }
}
```

## Performance Considerations

1. **Connection Pooling** - Mongoose automatically manages connection pooling
2. **Lean Queries** - Use `.lean()` for read-only operations to reduce memory
3. **Indexes** - Schemas include indexes on frequently queried fields (title, status, category)
4. **Pagination** - API routes support `limit` and `skip` for large datasets

## Next Steps

1. Configure MongoDB Atlas or local MongoDB
2. Set `MONGODB_URI` environment variable
3. Run `pnpm run seed` to populate sample data
4. Start the dev server with `pnpm dev`
5. Test API endpoints with your client application

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
