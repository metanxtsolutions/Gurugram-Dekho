import bcrypt from 'bcryptjs';
import prisma from '../lib/db';
import { parseLegacyHours } from '../lib/opening-hours';
import { randomBytes } from 'node:crypto';

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

/** Create (or reuse) an Image row and return its id. */
async function imageId(url: string, alt: string) {
  const existing = await prisma.image.findFirst({ where: { url } });
  if (existing) return existing.id;
  const created = await prisma.image.create({ data: { url, alt } });
  return created.id;
}

const CATEGORIES = [
  { name: 'Food & Dining', slug: 'food-dining', icon: 'utensils', description: 'Restaurants, cafés and street food across Gurugram.' },
  { name: 'Travel & Places', slug: 'travel-places', icon: 'map', description: 'Neighbourhoods, landmarks and day trips.' },
  { name: 'Events', slug: 'events', icon: 'calendar', description: "What's on in Gurugram this week." },
  { name: 'Stays & Living', slug: 'stays-accommodation', icon: 'home', description: 'Rentals, PGs and hotels.' },
  { name: 'Business & Work', slug: 'business-work', icon: 'briefcase', description: 'Offices, coworking and the job market.' },
  { name: 'Shopping', slug: 'shopping', icon: 'bag', description: 'Malls, markets and factory outlets.' },
  { name: 'Education', slug: 'education', icon: 'book', description: 'Schools, colleges and coaching.' },
  { name: 'Lifestyle', slug: 'lifestyle', icon: 'sparkles', description: 'Fitness, wellness and culture.' },
];

const AREAS = [
  { name: 'Sector 29', slug: 'sector-29', tagline: 'Food and nightlife capital', description: 'Gurugram’s densest cluster of restaurants and bars, built around the Leisure Valley park.', image: 'photo-1514933651103-005eec06c04b', lat: 28.4595, lng: 77.0592 },
  { name: 'Cyber City', slug: 'cyber-city', tagline: 'Offices, towers, Cyber Hub', description: 'The corporate core of Gurugram, home to DLF Cyber Hub and most of the city’s tech offices.', image: 'photo-1470723710355-95304d8aece4', lat: 28.4389, lng: 77.0668 },
  { name: 'Golf Course Road', slug: 'golf-course-road', tagline: 'Premium dining and hotels', description: 'A high-end residential and hospitality corridor running south from Sector 42.', image: 'photo-1566073771259-6a8506099945', lat: 28.4589, lng: 77.0583 },
  { name: 'MG Road', slug: 'mg-road', tagline: 'Malls, metro, mid-city', description: 'Gurugram’s original mall strip, still the easiest area to reach by metro.', image: 'photo-1519567241046-7f570eee3ce6', lat: 28.4801, lng: 77.0805 },
  { name: 'Sohna Road', slug: 'sohna-road', tagline: 'Cafés and quiet corners', description: 'A fast-growing residential belt with a strong independent café scene.', image: 'photo-1554118811-1e0d58224f24', lat: 28.4089, lng: 77.0392 },
  { name: 'Old Gurgaon', slug: 'old-gurgaon', tagline: 'Bazaars and street food', description: 'Sadar Bazaar, Jacobpura and the parts of the city that predate the towers.', image: 'photo-1555396273-367ea4eb4db5', lat: 28.4601, lng: 77.0299 },
  { name: 'DLF Phase 3', slug: 'dlf-phase-3', tagline: 'Established residential', description: 'Long-settled DLF colony next to Cyber City, popular with families.', image: 'photo-1560448204-e02f11c3d0e2', lat: 28.4949, lng: 77.0921 },
  { name: 'Sector 56', slug: 'sector-56', tagline: 'Quiet and well connected', description: 'Residential sector at the southern end of the Rapid Metro line.', image: 'photo-1502005229762-cf1b2da7c5d6', lat: 28.4211, lng: 77.1015 },
  { name: 'Udyog Vihar', slug: 'udyog-vihar', tagline: 'Industrial and startups', description: 'Gurugram’s oldest industrial estate, now full of startups and warehouses.', image: 'photo-1497366216548-37526070297c', lat: 28.5021, lng: 77.0855 },
  { name: 'Dwarka Expressway', slug: 'dwarka-expressway', tagline: 'New Gurgaon', description: 'The newest growth corridor connecting Gurugram to Dwarka and the airport.', image: 'photo-1544620347-c4fd4a3d5957', lat: 28.4921, lng: 76.9905 },
];

const PLACES = [
  { name: 'Cafe Sol', slug: 'cafe-sol-sector-29', lat: 28.4667, lng: 77.0616, area: 'sector-29', type: 'cafe', cuisine: 'Café · Continental', price: '₹₹', rating: 4.5, featured: true, image: 'photo-1554118811-1e0d58224f24', description: 'A small all-day café off the main Sector 29 strip, better for a quiet weekday lunch than a Friday night.', address: 'Sector 29, Gurugram', phone: '+91-124-1234567', website: 'https://example.com/cafe-sol', hours: '8:00 AM – 11:00 PM', specialties: 'Cold brew, all-day breakfast, house focaccia' },
  { name: 'Flavors of Punjab', slug: 'flavors-indian-restaurant', lat: 28.4949, lng: 77.0885, area: 'cyber-city', type: 'restaurant', cuisine: 'North Indian', price: '₹₹₹', rating: 4.7, featured: true, image: 'photo-1585937421612-70a008356fbe', description: 'Traditional Punjabi cooking in the middle of Cyber City. Busy at lunch, calmer after 9pm.', address: 'DLF Cyber City, Gurugram', phone: '+91-124-2345678', website: 'https://example.com/flavors', hours: '12:00 PM – 11:30 PM', specialties: 'Dal makhani, sarson da saag, tandoori platter' },
  { name: 'The Rooftop Grill', slug: 'rooftop-grill-golf-course', lat: 28.4421, lng: 77.0995, area: 'golf-course-road', type: 'restaurant', cuisine: 'Grill · Bar', price: '₹₹₹₹', rating: 4.6, featured: true, image: 'photo-1552566626-52f8b828add9', description: 'One of the few Golf Course Road rooftops with an actual view rather than a wall of glass.', address: 'Golf Course Road, Gurugram', phone: '+91-124-3456780', website: 'https://example.com/rooftop-grill', hours: '6:00 PM – 1:00 AM', specialties: 'Charcoal grill, cocktails, sunset seating' },
  { name: 'Sadar Chaat House', slug: 'sadar-chaat-house', lat: 28.4646, lng: 77.0299, closedOn: 2, area: 'old-gurgaon', type: 'street food', cuisine: 'Street food', price: '₹', rating: 4.4, featured: true, image: 'photo-1601050690597-df0568f70950', description: 'A Sadar Bazaar institution. Cash only, no seating, and worth the queue.', address: 'Sadar Bazaar, Old Gurgaon', phone: '+91-124-4567891', hours: '11:00 AM – 9:00 PM', specialties: 'Aloo tikki, golgappe, dahi bhalla' },
  { name: 'Bookmark Coffee', slug: 'bookmark-coffee-sohna-road', lat: 28.4089, lng: 77.0392, area: 'sohna-road', type: 'cafe', cuisine: 'Café', price: '₹₹', rating: 4.3, image: 'photo-1501339847302-ac426a4a7cbb', description: 'Laptop-friendly café with reliable wifi and plug points at most tables.', address: 'Sohna Road, Gurugram', hours: '9:00 AM – 10:00 PM', specialties: 'Pour-over, cheesecake, quiet corners' },
  { name: 'Plaza Market', slug: 'plaza-market-mg-road', lat: 28.4801, lng: 77.0805, area: 'mg-road', type: 'shopping', cuisine: '', price: '₹₹₹', rating: 4.2, image: 'photo-1441986300917-64674bd600d8', description: 'Mid-city mall with the usual international brands plus a decent food court.', address: 'MG Road, Gurugram', hours: '11:00 AM – 10:00 PM', specialties: 'Apparel, electronics, food court' },
  { name: 'Still Wellness Spa', slug: 'still-wellness-golf-course', lat: 28.4395, lng: 77.1011, closedOn: 1, area: 'golf-course-road', type: 'spa', cuisine: '', price: '₹₹₹₹', rating: 4.6, image: 'photo-1540555700478-4be289fbecef', description: 'Appointment-only spa attached to a hotel; book at least a day ahead on weekends.', address: 'Golf Course Road, Gurugram', hours: '10:00 AM – 9:00 PM', specialties: 'Deep tissue, aromatherapy, couples suites' },
  { name: 'Hub Coworking', slug: 'hub-coworking-udyog-vihar', lat: 28.5021, lng: 77.0855, area: 'udyog-vihar', type: 'coworking', cuisine: '', price: '₹₹', rating: 4.1, image: 'photo-1497366216548-37526070297c', description: 'Day passes without a membership, and meeting rooms you can book by the hour.', address: 'Udyog Vihar Phase 4, Gurugram', hours: '9:00 AM – 8:00 PM', specialties: 'Day passes, meeting rooms, printing' },
];

const ARTICLES = [
  { title: 'The Sector 29 Food Guide: 24 Places Worth the Parking Hunt', slug: 'sector-29-food-guide-gurugram', areas: ['sector-29'], category: 'food-dining', featured: true, readMins: 11, image: 'photo-1517248135467-4c7edcad34c4', excerpt: "Gurugram's loudest food block, decoded. Where to go for a quiet weekday lunch, which rooftops actually have a view, and the three places locals still queue for after midnight.", content: '<p>Sector 29 is the block everyone names when you ask where to eat in Gurugram, and it is also the block everyone complains about. Parking is genuinely difficult after 8pm on a Friday, and the noise on the main strip makes conversation hard.</p><h2>Where to go on a weekday</h2><p>The quieter end, closer to Leisure Valley, has a handful of all-day cafes that are almost empty at lunch. This is where to go if you want to actually talk to someone.</p><h2>Rooftops with a real view</h2><p>Most of the rooftops here look onto other buildings. Three of them do not, and they are worth the premium.</p><h2>After midnight</h2><p>The kitchens that stay open past 1am are a short list, and the queue outside them is the most reliable signal of quality in the whole sector.</p>' },
  { title: 'Cyber Hub vs Cyber City: What Actually Changed in 2026', slug: 'cyber-hub-vs-cyber-city-2026', areas: ['cyber-city', 'dlf-phase-3', 'udyog-vihar'], category: 'business-work', featured: true, readMins: 7, image: 'photo-1486406146926-c627a92ad1ab', excerpt: 'New towers, new metro links, and a rent curve that surprised everyone.', content: '<p>People use the two names interchangeably, which causes a lot of confusion when you are trying to give directions. Cyber Hub is the dining and entertainment complex; Cyber City is the much larger office district around it.</p><h2>What changed this year</h2><p>Two new towers opened on the eastern edge, and the shuttle routes were redrawn to match.</p><h2>What it means for rent</h2><p>Office rents held steadier than most brokers predicted, but residential rents within walking distance did not.</p>' },
  { title: 'Moving to Gurugram? Read This Before You Sign a Lease', slug: 'moving-to-gurugram-rental-guide', areas: ['sohna-road', 'dlf-phase-3', 'sector-56', 'dwarka-expressway'], category: 'stays-accommodation', featured: true, readMins: 9, image: 'photo-1560448204-e02f11c3d0e2', excerpt: 'Deposits, brokerage, water supply, power backup. The questions that matter.', content: '<p>The listing photos will not tell you about the water supply, and the broker will not raise it unless you do. Here is the list of questions worth asking before you sign anything.</p><h2>Deposits and brokerage</h2><p>Two to three months is standard for the deposit. Brokerage is usually one month, and it is negotiable more often than people assume.</p><h2>Power backup</h2><p>Ask specifically how many kilowatts of backup the flat gets, not whether the building "has a generator". Those are very different answers in summer.</p><h2>Water</h2><p>Some sectors are on borewell supply with tanker top-ups. Ask which, and ask what the monthly tanker cost has been.</p>' },
  { title: 'Weekend Escapes Within 90 Minutes of Gurugram', slug: 'weekend-escapes-near-gurugram', areas: ['sohna-road'], category: 'travel-places', featured: true, readMins: 6, image: 'photo-1506905925346-21bda4d32df4', excerpt: "Damdama, Sohna, Neemrana and four places you haven't tried yet.", content: '<p>Everyone does Neemrana once. These are the trips worth doing twice, all reachable before lunch if you leave early enough.</p><h2>Damdama Lake</h2><p>Closest of the lot, and best early in the morning before the day crowd arrives.</p><h2>Sohna</h2><p>Hot springs and a steady climb into the Aravallis. Better in winter.</p>' },
  { title: 'Budget Eats Under ₹300 Across Old Gurgaon', slug: 'budget-eats-under-300-old-gurgaon', areas: ['old-gurgaon'], category: 'food-dining', readMins: 5, image: 'photo-1601050690597-df0568f70950', excerpt: 'Sadar Bazaar chaat, Jacobpura kebabs, and canteens that never raised prices.', content: '<p>Old Gurgaon is where the city eats when it is not expensing the meal. Almost everything on this list is under three hundred rupees for two.</p><h2>Sadar Bazaar</h2><p>Start at the chaat stalls near the main crossing and work outward.</p><h2>Jacobpura</h2><p>Kebabs in the evening, and very little seating anywhere.</p>' },
  { title: 'The Rapid Metro, Explained for New Residents', slug: 'rapid-metro-gurugram-explained', areas: ['cyber-city', 'mg-road', 'sector-56', 'golf-course-road'], category: 'travel-places', readMins: 6, image: 'photo-1544620347-c4fd4a3d5957', excerpt: "Every station, what's walkable from it, and when to skip it.", content: '<p>The Rapid Metro is a loop, not a line, which is the single most confusing thing about it for newcomers.</p><h2>What is walkable</h2><p>Roughly half the stations put you within ten minutes of somewhere useful. The other half do not.</p><h2>When to skip it</h2><p>Between 6pm and 8pm on the southern stretch, a cab is often faster despite the traffic.</p>' },
  { title: 'Where Gurugram Actually Shops on a Saturday', slug: 'gurugram-saturday-shopping-guide', areas: ['mg-road', 'old-gurgaon', 'udyog-vihar'], category: 'shopping', readMins: 8, image: 'photo-1441986300917-64674bd600d8', excerpt: 'Beyond the three big malls: markets, thrift, and factory outlets.', content: '<p>The malls are fine. They are also not where most of the city shops on a Saturday afternoon.</p><h2>Sector markets</h2><p>Almost every sector has a market block, and the older ones have the better tailors.</p><h2>Factory outlets</h2><p>Concentrated along the Udyog Vihar side, with genuinely steep discounts if you are willing to dig.</p>' },
  { title: 'Best Coworking Spaces for Founders and Freelancers', slug: 'best-coworking-spaces-gurugram', areas: ['cyber-city', 'udyog-vihar', 'sohna-road'], category: 'business-work', readMins: 7, image: 'photo-1497366216548-37526070297c', excerpt: 'Day passes, meeting rooms, and which ones have real coffee.', content: '<p>Most coworking spaces in Gurugram will sell you a day pass without a membership. Fewer will let you book a meeting room on the same terms.</p><h2>Day passes</h2><p>Expect somewhere between six hundred and twelve hundred rupees depending on the area.</p><h2>The coffee question</h2><p>Three of them have an actual espresso machine. The rest have a vending machine, and it matters more than you think on a long day.</p>' },
  { title: 'A Practical Guide to Gurugram Schools by Sector', slug: 'gurugram-schools-by-sector-guide', areas: ['sector-56', 'dlf-phase-3', 'sohna-road'], category: 'education', readMins: 10, image: 'photo-1503676260728-1c00da094a0b', excerpt: 'Admission timelines, transport radius, and what the fee structures actually include.', content: '<p>Admission season starts earlier than most parents expect, and the transport radius is the constraint that decides the shortlist more often than the curriculum.</p><h2>Timelines</h2><p>Registration for most schools opens in the last quarter of the year.</p><h2>What fees include</h2><p>Read the annual charges separately from the tuition. The gap between the two is often substantial.</p>' },
  { title: 'Where to Run, Swim and Train in Gurugram', slug: 'fitness-guide-gurugram', areas: ['sector-29', 'golf-course-road', 'dlf-phase-3'], category: 'lifestyle', readMins: 6, image: 'photo-1571019613454-1cb2f99b2d8b', excerpt: 'Parks with real running loops, pools open to non-members, and honest gym pricing.', content: '<p>Leisure Valley and Aravalli Biodiversity Park are the two running loops worth planning around. Everything else is a footpath.</p><h2>Pools</h2><p>A handful of hotel pools sell day access, which is usually cheaper than a gym membership you will not use.</p><h2>Gyms</h2><p>Ask about the annual lock-in before the monthly rate. That is where the real cost sits.</p>' },
];

async function main() {
  console.log('Seeding database…');

  // ── Users ────────────────────────────────────────────────
  /*
    The seed password comes from the environment. It used to be the literal
    'admin123', which shipped in a public repository and was shared by the
    admin account and every author account.

    With SEED_ADMIN_PASSWORD unset a strong random one is generated and printed
    once, so a fresh local seed still works without anyone inventing a weak
    default. Nothing is ever written back to the repository.
  */
  const seedPassword =
    process.env.SEED_ADMIN_PASSWORD || randomBytes(15).toString('base64url');

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log('\n  SEED_ADMIN_PASSWORD was not set, so one was generated.');
    console.log('  Save it now, it is not stored anywhere and will not be shown again:');
    console.log(`\n    ${seedPassword}\n`);
  }

  const password = await bcrypt.hash(seedPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gurugramdekho.com' },
    update: { name: 'Admin User', role: 'admin', isActive: true },
    create: {
      name: 'Admin User',
      email: 'admin@gurugramdekho.com',
      password,
      role: 'admin',
      isActive: true,
      bio: 'Editorial account for Gurugram Dekho.',
    },
  });

  const authors = await Promise.all(
    [
      { name: 'Ananya Rao', email: 'ananya@gurugramdekho.com', bio: 'Writes about food and the places it comes from. Based in Sector 29.' },
      { name: 'Rohit Malhotra', email: 'rohit@gurugramdekho.com', bio: 'Covers work, transport and how the city is built.' },
      { name: 'Priya Sethi', email: 'priya@gurugramdekho.com', bio: 'Reports on housing, rentals and everyday costs in Gurugram.' },
      { name: 'Kabir Nanda', email: 'kabir@gurugramdekho.com', bio: 'Travel and weekends, usually somewhere in the Aravallis.' },
    ].map((a) =>
      prisma.user.upsert({
        where: { email: a.email },
        update: { name: a.name, bio: a.bio, role: 'author', isActive: true },
        create: { ...a, password, role: 'author', isActive: true },
      })
    )
  );
  console.log(`  users: ${1 + authors.length}`);

  // ── Categories ───────────────────────────────────────────
  const categories = await Promise.all(
    CATEGORIES.map((c, i) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, description: c.description, icon: c.icon, order: i + 1, isActive: true },
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          order: i + 1,
          isActive: true,
          seoTitle: `${c.name} in Gurugram`,
          seoDescription: c.description,
        },
      })
    )
  );
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  console.log(`  categories: ${categories.length}`);

  // ── Areas ────────────────────────────────────────────────
  const areas = await Promise.all(
    AREAS.map(async (a, i) => {
      const id = await imageId(img(a.image, 900), a.name);
      const data = {
        name: a.name,
        description: a.description,
        tagline: a.tagline,
        type: 'sector',
        order: i + 1,
        isActive: true,
        latitude: a.lat,
        longitude: a.lng,
        imageId: id,
        seoTitle: `${a.name}, Gurugram`,
        seoDescription: a.description,
      };
      return prisma.area.upsert({
        where: { slug: a.slug },
        update: data,
        create: { ...data, slug: a.slug },
      });
    })
  );
  const areaBySlug = new Map(areas.map((a) => [a.slug, a]));
  console.log(`  areas: ${areas.length}`);

  // ── Places ───────────────────────────────────────────────
  const places = await Promise.all(
    PLACES.map(async (p) => {
      const area = areaBySlug.get(p.area);
      if (!area) throw new Error(`Unknown area for place ${p.slug}: ${p.area}`);
      const id = await imageId(img(p.image, 800), p.name);

      const data = {
        name: p.name,
        description: p.description,
        placeType: p.type,
        areaId: area.id,
        address: p.address ?? null,
        latitude: p.lat ?? null,
        longitude: p.lng ?? null,
        phone: p.phone ?? null,
        website: p.website ?? null,
        hours: p.hours ?? null,
        cuisine: p.cuisine || null,
        specialties: p.specialties ?? null,
        priceRange: p.price,
        rating: p.rating,
        featured: p.featured ?? false,
        status: 'published',
        isActive: true,
        editorId: admin.id,
        imageId: id,
        seoTitle: `${p.name}, ${area.name}`,
        seoDescription: p.description,
      };

      return prisma.place.upsert({
        where: { slug: p.slug },
        update: data,
        create: { ...data, slug: p.slug },
      });
    })
  );
  // Structured opening hours, so "open now" is answerable.
  let intervals = 0;
  for (const [index, p] of PLACES.entries()) {
    const place = places[index];
    await prisma.openingHour.deleteMany({ where: { placeId: place.id } });
    if (!p.hours) continue;

    const parsed = parseLegacyHours(p.hours);
    if (!parsed) continue;

    // Most listings keep the same hours all week; a couple close on a weekday,
    // which is what makes the "open now" state worth showing at all.
    const closedDay = p.closedOn;
    const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== closedDay);

    await prisma.openingHour.createMany({
      data: days.map((day) => ({
        placeId: place.id,
        day,
        opensAt: parsed.opensAt,
        closesAt: parsed.closesAt,
      })),
    });
    intervals += days.length;
  }

  console.log(`  places: ${places.length} (${intervals} opening intervals)`);

  // ── Articles ─────────────────────────────────────────────
  const now = Date.now();
  let count = 0;
  let areaLinks = 0;

  for (const [i, a] of ARTICLES.entries()) {
    const author = authors[i % authors.length];
    const publishedAt = new Date(now - i * 2 * 86_400_000);

    const data = {
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      featuredImageId: await imageId(img(a.image, 1600), a.title),
      authorId: author.id,
      status: 'published',
      featured: a.featured ?? false,
      readMins: a.readMins,
      viewCount: 400 + i * 137,
      isActive: true,
      publishedAt,
      seoTitle: a.title,
      seoDescription: a.excerpt,
      seoKeywords: `Gurugram, Gurgaon, ${a.category.replace('-', ' ')}`,
    };

    const article = await prisma.article.upsert({
      where: { slug: a.slug },
      update: data,
      create: { ...data, slug: a.slug },
    });

    const category = categoryBySlug.get(a.category);
    if (category) {
      await prisma.articleCategory.upsert({
        where: { articleId_categoryId: { articleId: article.id, categoryId: category.id } },
        update: {},
        create: { articleId: article.id, categoryId: category.id },
      });
    }

    // Area coverage: declared, not inferred from the prose.
    const areaIds = (a.areas ?? [])
      .map((slug) => areaBySlug.get(slug)?.id)
      .filter((id): id is string => Boolean(id));

    for (const areaId of areaIds) {
      await prisma.articleArea.upsert({
        where: { articleId_areaId: { articleId: article.id, areaId } },
        update: {},
        create: { articleId: article.id, areaId },
      });
    }
    // Drop coverage that was removed from the seed.
    await prisma.articleArea.deleteMany({
      where: { articleId: article.id, areaId: { notIn: areaIds } },
    });
    areaLinks += areaIds.length;

    count++;
  }
  console.log(`  articles: ${count} (${ARTICLES.filter((a) => a.featured).length} featured)`);
  console.log(`  article↔area links: ${areaLinks}`);

  // ── Prune ────────────────────────────────────────────────
  // Drop rows from earlier seed revisions so this file stays the source of
  // truth and counts on the homepage match what is defined here.
  const pruned = await Promise.all([
    prisma.article.deleteMany({ where: { slug: { notIn: ARTICLES.map((a) => a.slug) } } }),
    prisma.place.deleteMany({ where: { slug: { notIn: PLACES.map((p) => p.slug) } } }),
    prisma.area.deleteMany({ where: { slug: { notIn: AREAS.map((a) => a.slug) } } }),
    prisma.category.deleteMany({ where: { slug: { notIn: CATEGORIES.map((c) => c.slug) } } }),
  ]);
  const removed = pruned.reduce((sum, r) => sum + r.count, 0);
  if (removed > 0) console.log(`  pruned ${removed} stale row(s) from earlier seeds`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
