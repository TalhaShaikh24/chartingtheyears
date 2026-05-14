# Charting the Years - Book Management Dashboard

A professional Next.js 16 admin dashboard for managing a collection of historical books with categories, tags, and ratings. Built with React Hook Form, Zod validation, MongoDB, and custom Tailwind CSS components.

## Features

- **Dashboard** - Overview stats (total books, countries, average rating) and recent books table
- **Books Management** - Full CRUD operations with search, filtering, and edit/delete actions
- **Add/Edit Books** - Comprehensive form with validation for book metadata (title, author, year, country, category, language, rating, type, status, tags, review)
- **Categories** - View all categories with book counts and category breakdown with distribution charts
- **Tags** - Grid view of all tags with associated book counts
- **Settings** - Manage site configuration, display options, and view database statistics

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4.2 with custom color palette
- **Forms:** React Hook Form + Zod validation (client & server-side)
- **Database:** MongoDB with native Node.js driver
- **UI Components:** Custom lightweight Tailwind components (Button, Input, Select, Badge, Card, Table, Textarea, Checkbox)
- **Fonts:** Plus Jakarta Sans (Google Fonts)

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin pages
│   │   ├── dashboard/page.tsx
│   │   ├── books/
│   │   │   ├── page.tsx       # Books list
│   │   │   ├── add/page.tsx   # Add book form
│   │   │   └── [id]/edit/     # Edit book form
│   │   ├── categories/page.tsx
│   │   ├── tags/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx         # Admin layout (Sidebar + Topbar)
│   ├── api/                   # API routes
│   │   ├── books/             # Books CRUD endpoints
│   │   ├── categories/        # Categories endpoints
│   │   ├── tags/              # Tags endpoints
│   │   └── settings/          # Settings & stats endpoints
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Textarea.tsx
│   │   └── Checkbox.tsx
│   ├── layout/                # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageLayout.tsx
│   └── features/              # Feature components
│       ├── BookForm.tsx
│       └── StatsCard.tsx
└── lib/
    ├── db.ts                  # MongoDB connection
    ├── schemas.ts             # Zod validation schemas
    └── utils.ts               # Utility functions
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB Atlas account (or local MongoDB instance)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chartingtheyears?retryWrites=true&w=majority
MONGODB_DB=chartingtheyears
```

Get your MongoDB URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database user
3. Click "Connect" → "Drivers" → Copy the connection string
4. Replace `<username>` and `<password>` with your credentials

### 3. Seed Sample Data (Optional)

```bash
pnpm run seed
```

This will populate your database with sample books, categories, tags, and settings.

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be automatically redirected to the dashboard.

## API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books?limit=5&skip=0` - Get books with limit/offset
- `GET /api/books/[id]` - Get single book
- `GET /api/books/search?q=query` - Search books by title/author/category
- `POST /api/books` - Create new book
- `PATCH /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book

### Categories
- `GET /api/categories` - Get all categories

### Tags
- `GET /api/tags` - Get all tags

### Settings & Stats
- `GET /api/settings` - Get site settings
- `PATCH /api/settings` - Update site settings
- `GET /api/settings/stats` - Get database statistics

## Form Validation

All forms use Zod schemas for validation. Schemas are defined in `src/lib/schemas.ts`:

- `BookSchema` - Validates book data with required fields
- `CategorySchema` - Validates category data
- `TagSchema` - Validates tag data
- `SettingsSchema` - Validates site settings

## Color Palette

The dashboard uses a warm, professional color scheme:
- **Background:** Light beige (`oklch(0.97 0.01 60)`)
- **Primary:** Taupe (`oklch(0.4 0.05 60)`)
- **Accent:** Teal (`oklch(0.48 0.08 200)`)
- **Destructive:** Red (`oklch(0.63 0.22 25)`)

All colors are customizable via CSS variables in `app/globals.css`.

## Building for Production

```bash
pnpm run build
pnpm start
```

## Troubleshooting

### "MONGODB_URI not found" Error
Make sure you've created `.env.local` with your MongoDB connection string.

### "Failed to fetch books" on Dashboard
1. Check your MongoDB connection string in `.env.local`
2. Ensure your database credentials are correct
3. Check MongoDB Atlas IP whitelist allows your IP

### Forms not submitting
1. Check browser console for validation errors
2. Ensure MongoDB collections exist (run seed script)
3. Verify API routes are accessible

## Future Enhancements

- User authentication (sign-in/sign-out)
- Book image uploads with Vercel Blob
- Advanced filtering and sorting options
- Batch operations (bulk edit/delete)
- Export data to CSV
- Dark mode toggle
- Mobile-responsive design improvements

## License

MIT

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
