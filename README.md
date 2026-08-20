# GurugramDekho - Local Discovery Platform

Custom-coded, SEO-first local discovery platform for Gurugram/Gurgaon.

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Hosting:** Vercel
- **Authentication:** Next-Auth (to be implemented)

## Project Structure

```
gurugramdeckho/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── articles/          # Article CRUD
│   │   ├── places/            # Place/Business CRUD
│   │   ├── areas/             # Area/Sector CRUD
│   │   ├── categories/        # Category management
│   │   └── search/            # Search API
│   ├── (routes)/              # Page routes (to be created)
│   ├── admin/                 # Admin panel (to be created)
│   ├── layout.tsx             # Root layout with SEO metadata
│   ├── page.tsx               # Homepage
│   └── globals.css
├── components/                # Reusable React components (to be created)
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── seo.ts                 # SEO utilities (schema markup, metadata)
│   └── utils.ts               # General utilities (pagination, formatting)
├── prisma/
│   └── schema.prisma          # Complete database schema
├── public/                    # Static assets
├── .env.local                 # Local environment variables (NOT in git)
├── .env.example               # Template for environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd gurugramdekho
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL (Development)

```bash
# If you have PostgreSQL installed locally
createdb gurugramdekho

# Update .env.local with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/gurugramdekho"
```

#### Option B: Vercel Postgres (Production)

```bash
# Create a Vercel account and link project
npm i @vercel/postgres

# Get connection string from Vercel Dashboard
# Update .env.local
```

#### Option C: Docker (Recommended for development)

```bash
docker run --name postgres-gurugramdekho \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gurugramdekho \
  -p 5432:5432 \
  -d postgres:latest

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/gurugramdekho"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Create Root Category

```bash
# Use Prisma Studio to create initial categories
# Or create via the API once it's running
```

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints (Implemented)

### Articles
- `GET /api/articles` - List articles with pagination, filtering
- `POST /api/articles` - Create article (auth required)
- `GET /api/articles/[id]` - Get single article
- `PATCH /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

### Places
- `GET /api/places` - List places (paginated, filtered by area, type)
- `POST /api/places` - Create place
- `GET /api/places/[id]` - Get single place (to be added)
- `PATCH /api/places/[id]` - Update place (to be added)

### Categories
- `GET /api/categories` - List categories (hierarchical)
- `POST /api/categories` - Create category

### Areas
- `GET /api/areas` - List areas
- `POST /api/areas` - Create area

### Search
- `GET /api/search?q=query` - Full-text search

## Database Schema

The Prisma schema includes these models:

- **User** - Authors, editors, admins
- **Article** - Blog posts, guides, news
- **Category** - Hierarchical content categories
- **Tag** - Article tags
- **Area** - Sectors, neighborhoods, zones
- **Place** - Businesses, restaurants, shops
- **Event** - Events and announcements
- **Page** - Static pages (About, Contact, etc.)
- **Image** - Media management
- **Analytics** - View tracking
- **SearchLog** - Search analytics

## Next Steps (Phase 5-7: Frontend, Admin, Content)

1. **Frontend Pages** (Week 5-8)
   - Category archive pages
   - Article detail pages
   - Place detail pages
   - Area profile pages
   - Search results page
   - Static pages

2. **Admin Panel** (Week 8-10)
   - Content management interface
   - User management
   - SEO configuration
   - Analytics dashboard

3. **Content & SEO** (Week 10-12)
   - Seed 50-100 Gurugram articles
   - Implement automatic sitemap generation
   - Add schema markup
   - Set up internal linking

4. **Deployment** (Week 13-14)
   - Configure Vercel
   - Set up GitHub CI/CD
   - Configure domain
   - Launch monitoring

## Development Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma migrate dev         # Create and apply migrations
npx prisma migrate reset       # Reset database (development only)
npx prisma studio            # Open database GUI

# Code Quality
npm run lint                   # Run ESLint
npm run type-check             # Check TypeScript
```

## Security Reminders

- Never commit `.env.local` - it's in `.gitignore`
- Use strong `NEXTAUTH_SECRET`
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## License

Private project - Bijay Sharma

---

**Status:** Phase 4 in progress
**Next:** Phase 5 - Frontend Pages
**Timeline:** 14-week development plan
EOF
