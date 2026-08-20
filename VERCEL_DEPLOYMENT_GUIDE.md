# 🚀 Vercel Deployment Guide

**GurugramDekho - Production Deployment Steps**

Deploy your fully-built platform to Vercel in ~15 minutes.

---

## 📋 PRE-DEPLOYMENT REQUIREMENTS

Before deploying, have these ready:

1. **Production Database URL**
   - PostgreSQL instance
   - Connection string: `postgresql://user:password@host:port/database`
   - OR use Vercel Postgres (recommended)

2. **NEXTAUTH_SECRET**
   - Generate with: `openssl rand -base64 32`
   - Store safely

3. **Domain Name** (optional)
   - gurugramdekho.com
   - Or use Vercel's auto-assigned domain

4. **GitHub Account** (optional but recommended)
   - For easier deployments and CI/CD

---

## 🔧 STEP 1: PREPARE PROJECT

### 1.1 Verify local build succeeds
```bash
cd "/Users/bijaysharma/Desktop/Claude web/gurugramdekho"
npm run build
```

Expected: Build completes in ~2 minutes with no errors

### 1.2 Run verification checklist
Follow: `PRE_DEPLOYMENT_VERIFICATION.md` (all phases 1-10)

### 1.3 Commit code (if using Git)
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

---

## 🌐 STEP 2: CREATE VERCEL ACCOUNT

### 2.1 Sign up (if new user)
```bash
npm install -g vercel
vercel login
```

Or visit: https://vercel.com/signup

### 2.2 Connect GitHub (recommended)
- In Vercel dashboard: Settings → Integrations
- Connect your GitHub account
- Select repository: `gurugramdekho`

---

## 📦 STEP 3: DATABASE SETUP

### Option A: Vercel Postgres (Recommended)

```bash
# Install Vercel CLI (if not done)
npm install -g vercel

# Login
vercel login

# Create Vercel Postgres database
vercel postgres create
```

Follow prompts and copy connection string.

**Pros:** Managed, integrated with Vercel, automatic backups
**Cons:** Paid service

### Option B: Self-Hosted PostgreSQL

If you have a PostgreSQL server:

1. Ensure database exists and is accessible
2. Connection format: 
   ```
   postgresql://username:password@hostname:5432/gurugramdekho
   ```
3. Ensure allow-list includes Vercel IPs

### Option C: Free Tier Alternatives

- **Railway.app** - Free tier available
- **Render.com** - Free tier available  
- **Neon.tech** - Serverless PostgreSQL

---

## 🔐 STEP 4: ENVIRONMENT VARIABLES

### 4.1 Create `.env.production.local`

```bash
# Copy template
cp .env.example .env.production.local

# Edit file
nano .env.production.local
```

### 4.2 Fill in production values

```env
# Database (from Step 3)
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://gurugramdekho.com"
NEXTAUTH_SECRET="your-secret-from-openssl"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional: CDN
NEXT_PUBLIC_CDN_URL="https://cdn.gurugramdekho.com"
```

### 4.3 Generate NEXTAUTH_SECRET
```bash
# If you don't have one
openssl rand -base64 32

# Copy the output and save it
```

---

## 🚀 STEP 5: DEPLOY TO VERCEL

### Method A: Via Vercel CLI (Fastest)

```bash
cd "/Users/bijaysharma/Desktop/Claude web/gurugramdekho"

# Deploy
vercel --prod

# Follow prompts:
# - Confirm project name
# - Link to existing project or create new
# - Set environment variables when prompted
```

### Method B: Via Vercel Dashboard (Most Visual)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import Git Repository
4. Select your repo
5. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: (auto-detected)
6. Environment Variables:
   - `DATABASE_URL` → (your PostgreSQL URL)
   - `NEXTAUTH_SECRET` → (your secret)
   - `NEXTAUTH_URL` → https://your-vercel-domain.vercel.app
7. Click "Deploy"

### Method C: Via GitHub (Best for Continuous Deployment)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select "Import Git Repository"
4. Choose your repo
5. Configure as in Method B
6. Click "Deploy"
7. Future pushes auto-deploy

---

## ✅ STEP 6: POST-DEPLOYMENT VERIFICATION

### 6.1 Check deployment status
```bash
# If using CLI
vercel --prod

# Output should show: ✓ Production: [URL]
```

### 6.2 Test production URL
Visit: https://your-project.vercel.app

- [ ] Homepage loads
- [ ] No 500 errors
- [ ] Admin login works
- [ ] Database queries successful

### 6.3 Check logs
```bash
# View recent logs
vercel logs --prod

# Or in Vercel dashboard: Deployments → Latest → Logs
```

### 6.4 Verify environment variables
In Vercel Dashboard → Settings → Environment Variables:
- DATABASE_URL ✓
- NEXTAUTH_SECRET ✓
- NEXTAUTH_URL ✓

### 6.5 Test key features
- [ ] Homepage renders
- [ ] Admin panel accessible
- [ ] Login/logout works
- [ ] Articles visible
- [ ] Search functional
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] RSS feed works (/feed.xml)

### 6.6 Check Core Web Vitals
Use: https://pagespeed.web.dev

Target metrics:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

## 🌍 STEP 7: CUSTOM DOMAIN (Optional)

### 7.1 Connect domain
In Vercel Dashboard → Project Settings → Domains:

1. Add domain: `gurugramdekho.com`
2. Follow DNS instructions (varies by registrar)
3. Common steps:
   - Go to domain registrar (GoDaddy, Namecheap, etc.)
   - DNS settings
   - Add CNAME record pointing to Vercel
   - Wait 24-48 hours for propagation

### 7.2 Enable HTTPS
- Automatic with Vercel
- Certificate auto-provisioned
- Redirects HTTP → HTTPS

### 7.3 Verify domain
In Vercel dashboard should show:
✓ gurugramdekho.com (Verified)

---

## 🔄 STEP 8: CONTINUOUS DEPLOYMENT

### 8.1 Auto-deploy on push
If using GitHub integration (recommended):
- Every push to `main` → auto-deploys
- Preview deployments for PRs
- Rollback to previous version if needed

### 8.2 Manual rollback (if issues)
```bash
# View deployment history
vercel deployments

# Rollback to previous
vercel rollback
```

---

## 📊 STEP 9: MONITORING

### Daily
- [ ] Check error logs in Vercel
- [ ] Monitor uptime

### Weekly
- [ ] Review analytics
- [ ] Check Core Web Vitals
- [ ] Search Console for crawl errors

### Monthly
- [ ] Database performance
- [ ] Cost review
- [ ] Security patches

### Monitoring Tools
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Search Console:** https://search.google.com/search-console
- **Google Analytics:** https://analytics.google.com

---

## 🆘 TROUBLESHOOTING

### Deployment fails
**Error:** Build fails with TypeScript errors
```bash
# Solution: Check .env.production.local
# Ensure all required vars are set
vercel env pull
npm run build
```

### Database connection error
**Error:** Connection refused or timeout
- [ ] Check DATABASE_URL format
- [ ] Verify database is running
- [ ] Ensure IP allow-list includes Vercel
- [ ] Run migration: `vercel env pull && npx prisma migrate deploy`

### Admin login fails
**Error:** 401 Unauthorized
- [ ] Check NEXTAUTH_SECRET is set
- [ ] Verify NEXTAUTH_URL matches your domain
- [ ] Clear browser cookies and try again

### 500 errors on pages
**Error:** Pages return 500
- [ ] Check Vercel logs: `vercel logs --prod`
- [ ] Verify database connection
- [ ] Check function execution time (max 60s)

### Sitemap/Feed not accessible
**Error:** 404 on /sitemap.xml or /feed.xml
- [ ] Check build logs
- [ ] Redeploy: `vercel --prod --force`

---

## 📈 PERFORMANCE OPTIMIZATION

### Already configured in GurugramDekho:
- ✅ Next.js Image optimization
- ✅ Code splitting
- ✅ CSS minification
- ✅ Dynamic imports
- ✅ Caching headers

### Additional optimizations (optional):
1. Enable Vercel Analytics
2. Use Vercel Edge Middleware
3. Add custom domain (faster CDN)
4. Upgrade to Pro plan (if traffic high)

---

## ✨ LAUNCH CHECKLIST

Before announcing launch:

- [ ] Domain configured and live
- [ ] HTTPS certificate active
- [ ] Admin panel accessible
- [ ] Sample data visible
- [ ] Search functional
- [ ] Sitemap indexed by Google
- [ ] Core Web Vitals green
- [ ] Error logs empty
- [ ] Database backups configured
- [ ] Monitoring/alerts set up

---

## 🎉 SUCCESS!

Your platform is now live!

**What's next:**
1. Submit sitemap to Google Search Console
2. Monitor analytics for week 1
3. Monitor error logs daily
4. Plan content strategy
5. Promote platform

---

## 📞 GETTING HELP

### Vercel Support
- Docs: https://vercel.com/docs
- Status: https://vercel.com/status
- Support: vercel.com/dashboard/support

### PostgreSQL Providers
- **Vercel Postgres:** https://vercel.com/docs/postgres
- **Railway:** https://railway.app/docs
- **Render:** https://render.com/docs
- **Neon:** https://neon.tech/docs

### Next.js Docs
- https://nextjs.org/docs
- https://nextjs.org/docs/deployment

---

**Deployment Guide: COMPLETE ✅**

Ready to go live? 🚀
