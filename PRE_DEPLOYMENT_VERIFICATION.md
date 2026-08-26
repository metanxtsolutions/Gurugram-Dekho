# 🧪 Pre-Deployment Verification Guide

**GurugramDekho - Local Testing Before Vercel Launch**

This guide walks you through verifying that everything works correctly before deploying to production.

---

## ⚡ QUICK START (5 minutes)

```bash
cd "/Users/bijaysharma/Desktop/Claude web/gurugramdekho"

# 1. Install dependencies (if not done)
npm install

# 2. Setup database
createdb gurugramdekho
export DATABASE_URL="postgresql://username:password@localhost:5432/gurugramdekho"

# 3. Initialize database
npx prisma migrate dev --name init

# 4. Seed demo data
npx ts-node prisma/seed.ts

# 5. Run dev server
npm run dev
```

Visit: **http://localhost:3000**

---

## ✅ VERIFICATION CHECKLIST

### Phase 1: Build Verification (1 min)
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors reported
- [ ] No ESLint warnings in console

### Phase 2: Database Verification (2 min)
```bash
# Verify database is running
psql gurugramdekho -c "SELECT COUNT(*) FROM Article;"

# Should return: count = 5
```
- [ ] 5 sample articles created
- [ ] 4 sample places created
- [ ] 10 areas/sectors created
- [ ] Admin user created (admin@gurugramdekho.com)

### Phase 3: Frontend Pages (5 min each)

#### Homepage
- [ ] Visit http://localhost:3000
- [ ] Hero section visible with "Discover Gurugram"
- [ ] Featured articles section shows content
- [ ] Category grid displays 5 categories
- [ ] Popular areas section visible
- [ ] Newsletter signup form present
- [ ] Footer with links visible

#### Article Page
- [ ] Click any article card
- [ ] Article title, content, author visible
- [ ] Related articles section shows recommendations
- [ ] Breadcrumbs show proper hierarchy
- [ ] Tags display correctly
- [ ] View count increments on page load

#### Place Page
- [ ] Click "Places" → select any place
- [ ] Place name, image, rating visible
- [ ] Contact information displayed
- [ ] Address and map coordinates shown
- [ ] Nearby places sidebar populated
- [ ] Price range indicator visible

#### Category Page
- [ ] Click any category
- [ ] Article list shows paginated results
- [ ] Category name in breadcrumbs
- [ ] Pagination controls work
- [ ] Can see 10+ articles if available

#### Area Page
- [ ] Click any area/sector
- [ ] Area name and description visible
- [ ] List of places in area displays
- [ ] Related guides section shows articles
- [ ] Sub-areas (if any) display correctly
- [ ] Coordinates shown

#### Search
- [ ] Go to http://localhost:3000/search
- [ ] Type "restaurant" in search box
- [ ] Results show articles, places, areas
- [ ] Can filter by type (article/place/area)
- [ ] Results update in real-time

### Phase 4: Admin Panel (5 min each)

#### Login
- [ ] Visit http://localhost:3000/admin
- [ ] Redirect to login page
- [ ] Email: `admin@gurugramdekho.com`
- [ ] Password: `SEED_ADMIN_PASSWORD` (set it before seeding; if unset the seed generates one and prints it once)
- [ ] Login successful → redirect to dashboard
- [ ] Session persists on page reload

#### Dashboard
- [ ] Stats cards show correct numbers
- [ ] Quick action buttons present
- [ ] No errors in console

#### Articles Management
- [ ] View all articles in table
- [ ] Table shows: title, author, category, views, status
- [ ] Can click edit on any article
- [ ] Can view article details

#### Places Management
- [ ] View all places in table
- [ ] Table shows: name, type, area, rating, status
- [ ] Can click edit on any place

#### Categories Management
- [ ] View all categories
- [ ] Hierarchy displays correctly
- [ ] Article count shown

#### Areas Management
- [ ] View all areas
- [ ] Count of places in each area shown
- [ ] Sub-areas display properly

#### Users Management
- [ ] View all users
- [ ] Admin user visible with correct role
- [ ] Can view user details

#### Settings
- [ ] Settings page loads
- [ ] Form fields display
- [ ] No API errors

### Phase 5: Admin Forms (3 min each)

#### Create Article (Optional)
- [ ] Go to Admin → Articles → Create
- [ ] Fill: Title, Slug, Content
- [ ] Fill: SEO Title, Description, Keywords
- [ ] Select Category
- [ ] Set Status to "Published"
- [ ] Submit → should redirect to articles list
- [ ] New article visible in list

#### Edit Article
- [ ] Click edit on any article
- [ ] Form pre-fills with current data
- [ ] Modify: Title or Content
- [ ] Submit → confirmation message
- [ ] Changes persist on reload

#### Delete Article (Optional - Use Care!)
- [ ] Click delete icon
- [ ] Confirmation dialog appears
- [ ] Click confirm → article removed
- [ ] Article disappears from list

### Phase 6: API Endpoints (2 min each)

#### Test with curl

```bash
# Articles API
curl "http://localhost:3000/api/articles?page=1&limit=10"

# Places API
curl "http://localhost:3000/api/places?area=cyber-city"

# Areas API
curl "http://localhost:3000/api/areas?parentOnly=true"

# Categories API
curl "http://localhost:3000/api/categories"

# Search API
curl "http://localhost:3000/api/search?q=restaurant&type=all"
```

Expected: Valid JSON responses with no errors

### Phase 7: SEO Features (2 min each)

#### Sitemap
- [ ] Visit http://localhost:3000/sitemap.xml
- [ ] XML displays (not HTML)
- [ ] Contains URLs for articles, places, areas
- [ ] Each URL has `<lastmod>` and `<priority>`

#### RSS Feed
- [ ] Visit http://localhost:3000/feed.xml
- [ ] XML displays with RSS structure
- [ ] Latest articles listed
- [ ] Each entry has title, link, description, date

#### Meta Tags
- [ ] View page source
- [ ] Check `<meta name="description">` present
- [ ] Check `<meta property="og:title">` present
- [ ] Check `<meta property="og:image">` present

#### Schema Markup
- [ ] View page source
- [ ] Check for `<script type="application/ld+json">` blocks
- [ ] Should contain Article, BreadcrumbList, or LocalBusiness schema

#### Robots.txt
- [ ] Visit http://localhost:3000/robots.txt
- [ ] Contains directives for search engines
- [ ] Allows `/` and disallows `/admin`, `/api`, `/auth`

### Phase 8: Responsive Design (2 min)

#### Mobile (375px)
- [ ] Open browser DevTools (F12)
- [ ] Set viewport to iPhone 12 (375x812)
- [ ] Navigate to each page
- [ ] Content readable without horizontal scroll
- [ ] Menu hamburger appears
- [ ] Buttons easily tappable

#### Tablet (768px)
- [ ] Set viewport to iPad (768x1024)
- [ ] Check layout adapts
- [ ] Sidebar visible on place/area pages

#### Desktop (1280px)
- [ ] Set viewport to desktop
- [ ] Two-column layouts render properly
- [ ] Sidebar positioned correctly

### Phase 9: Performance (2 min)

```bash
# Build for production
npm run build

# Check build size
du -sh .next
# Should be < 500MB
```

Metrics to check:
- [ ] Build completes in < 2 minutes
- [ ] No critical warnings
- [ ] `.next` directory size reasonable

### Phase 10: Security (2 min)

#### Password Hashing
- [ ] Login page accepts credentials
- [ ] Passwords NOT logged in console
- [ ] Session stored in HTTP-only cookie

#### Protected Routes
- [ ] Try accessing http://localhost:3000/admin (no auth)
- [ ] Should redirect to login
- [ ] Try accessing API without token
- [ ] Should return 401 Unauthorized

---

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql
```

### Port 3000 already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Prisma migration fails
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Admin login doesn't work
```bash
# Check admin user exists
psql gurugramdekho -c "SELECT email, role FROM User;"
```

---

## 📋 Sign-Off Checklist

Before deploying to Vercel, verify:

- [ ] All verification phases passed (1-10)
- [ ] No console errors or warnings
- [ ] Database seeding successful
- [ ] Admin login works
- [ ] At least 5 public pages render correctly
- [ ] Mobile, tablet, desktop all look good
- [ ] API endpoints return valid JSON
- [ ] SEO features working
- [ ] Build completes successfully
- [ ] Ready to deploy to Vercel

---

**Status: Ready for Verification ✅**

Start with Phase 1 and work through each phase. This ensures nothing is missed before production launch.

Good luck! 🚀
