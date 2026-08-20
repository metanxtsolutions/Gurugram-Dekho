/**
 * Curated editorial content used to render the site before the database is
 * seeded. Pages read from Prisma first and fall back to this so the layout is
 * never a wall of "Loading…" placeholders.
 */

export type Story = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  image: string;
  author: string;
  readMins: number;
  date: string;
};

export type AreaCard = {
  name: string;
  slug: string;
  tagline: string;
  image: string;
  places: number;
};

export type PlaceItem = {
  name: string;
  slug: string;
  area: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  image: string;
};

export type CategoryTile = {
  name: string;
  slug: string;
  blurb: string;
  count: number;
  /** Tailwind classes for the tile's icon chip */
  tone: string;
  icon: string;
};

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const FEATURED: Story[] = [
  {
    title: "The Sector 29 Food Guide: 24 Places Worth the Parking Hunt",
    slug: "sector-29-food-guide-gurugram",
    excerpt:
      "Gurugram's loudest food block, decoded. Where to go for a quiet weekday lunch, which rooftops actually have a view, and the three places locals still queue for after midnight.",
    category: "Food & Dining",
    categorySlug: "food-dining",
    image: u("photo-1517248135467-4c7edcad34c4", 1600),
    author: "Ananya Rao",
    readMins: 11,
    date: "Aug 14, 2026",
  },
  {
    title: "Cyber Hub vs Cyber City: What Actually Changed in 2026",
    slug: "cyber-hub-vs-cyber-city-2026",
    excerpt:
      "New towers, new metro links, and a rent curve that surprised everyone.",
    category: "Business & Work",
    categorySlug: "business-work",
    image: u("photo-1486406146926-c627a92ad1ab", 900),
    author: "Rohit Malhotra",
    readMins: 7,
    date: "Aug 12, 2026",
  },
  {
    title: "Moving to Gurugram? Read This Before You Sign a Lease",
    slug: "moving-to-gurugram-rental-guide",
    excerpt:
      "Deposits, brokerage, water supply, power backup — the questions that matter.",
    category: "Stays & Living",
    categorySlug: "stays-accommodation",
    image: u("photo-1560448204-e02f11c3d0e2", 900),
    author: "Priya Sethi",
    readMins: 9,
    date: "Aug 10, 2026",
  },
  {
    title: "Weekend Escapes Within 90 Minutes of Gurugram",
    slug: "weekend-escapes-near-gurugram",
    excerpt: "Damdama, Sohna, Neemrana and four places you haven't tried yet.",
    category: "Travel & Places",
    categorySlug: "travel-places",
    image: u("photo-1506905925346-21bda4d32df4", 900),
    author: "Kabir Nanda",
    readMins: 6,
    date: "Aug 8, 2026",
  },
];

export const LATEST: Story[] = [
  {
    title: "Budget Eats Under ₹300 Across Old Gurgaon",
    slug: "budget-eats-under-300-old-gurgaon",
    excerpt:
      "Sadar Bazaar chaat, Jacobpura kebabs, and canteens that never raised prices.",
    category: "Food & Dining",
    categorySlug: "food-dining",
    image: u("photo-1601050690597-df0568f70950", 800),
    author: "Ananya Rao",
    readMins: 5,
    date: "Aug 7, 2026",
  },
  {
    title: "The Rapid Metro, Explained for New Residents",
    slug: "rapid-metro-gurugram-explained",
    excerpt: "Every station, what's walkable from it, and when to skip it.",
    category: "Travel & Places",
    categorySlug: "travel-places",
    image: u("photo-1544620347-c4fd4a3d5957", 800),
    author: "Rohit Malhotra",
    readMins: 6,
    date: "Aug 5, 2026",
  },
  {
    title: "Where Gurugram Actually Shops on a Saturday",
    slug: "gurugram-saturday-shopping-guide",
    excerpt: "Beyond the three big malls — markets, thrift, and factory outlets.",
    category: "Shopping",
    categorySlug: "shopping",
    image: u("photo-1441986300917-64674bd600d8", 800),
    author: "Priya Sethi",
    readMins: 8,
    date: "Aug 3, 2026",
  },
  {
    title: "Best Coworking Spaces for Founders and Freelancers",
    slug: "best-coworking-spaces-gurugram",
    excerpt: "Day passes, meeting rooms, and which ones have real coffee.",
    category: "Business & Work",
    categorySlug: "business-work",
    image: u("photo-1497366216548-37526070297c", 800),
    author: "Kabir Nanda",
    readMins: 7,
    date: "Aug 1, 2026",
  },
];

export const AREAS: AreaCard[] = [
  {
    name: "Sector 29",
    slug: "sector-29",
    tagline: "Food and nightlife capital",
    image: u("photo-1514933651103-005eec06c04b", 800),
    places: 142,
  },
  {
    name: "Cyber City",
    slug: "cyber-city",
    tagline: "Offices, towers, Cyber Hub",
    image: u("photo-1470723710355-95304d8aece4", 800),
    places: 118,
  },
  {
    name: "Golf Course Road",
    slug: "golf-course-road",
    tagline: "Premium dining and hotels",
    image: u("photo-1566073771259-6a8506099945", 800),
    places: 96,
  },
  {
    name: "MG Road",
    slug: "mg-road",
    tagline: "Malls, metro, mid-city",
    image: u("photo-1519567241046-7f570eee3ce6", 800),
    places: 87,
  },
  {
    name: "Sohna Road",
    slug: "sohna-road",
    tagline: "Cafés and quiet corners",
    image: u("photo-1554118811-1e0d58224f24", 800),
    places: 74,
  },
  {
    name: "Old Gurgaon",
    slug: "old-gurgaon",
    tagline: "Bazaars and street food",
    image: u("photo-1555396273-367ea4eb4db5", 800),
    places: 65,
  },
];

export const PLACES: PlaceItem[] = [
  {
    name: "Cafe Sol",
    slug: "cafe-sol-sector-29",
    area: "Sector 29",
    cuisine: "Café · Continental",
    priceRange: "₹₹",
    rating: 4.5,
    image: u("photo-1554118811-1e0d58224f24", 700),
  },
  {
    name: "Flavors of Punjab",
    slug: "flavors-indian-restaurant",
    area: "Cyber City",
    cuisine: "North Indian",
    priceRange: "₹₹₹",
    rating: 4.7,
    image: u("photo-1585937421612-70a008356fbe", 700),
  },
  {
    name: "The Rooftop Grill",
    slug: "rooftop-grill-golf-course",
    area: "Golf Course Road",
    cuisine: "Grill · Bar",
    priceRange: "₹₹₹₹",
    rating: 4.6,
    image: u("photo-1552566626-52f8b828add9", 700),
  },
  {
    name: "Sadar Chaat House",
    slug: "sadar-chaat-house",
    area: "Old Gurgaon",
    cuisine: "Street food",
    priceRange: "₹",
    rating: 4.4,
    image: u("photo-1601050690597-df0568f70950", 700),
  },
];

export const CATEGORIES: CategoryTile[] = [
  {
    name: "Food & Dining",
    slug: "food-dining",
    blurb: "Restaurants, cafés, street food",
    count: 248,
    tone: "bg-brand-100 text-brand-700",
    icon: "utensils",
  },
  {
    name: "Travel & Places",
    slug: "travel-places",
    blurb: "Neighbourhoods and day trips",
    count: 164,
    tone: "bg-sky-100 text-sky-700",
    icon: "map",
  },
  {
    name: "Events",
    slug: "events",
    blurb: "What's on this week",
    count: 92,
    tone: "bg-violet-100 text-violet-700",
    icon: "calendar",
  },
  {
    name: "Stays & Living",
    slug: "stays-accommodation",
    blurb: "Rentals, PGs, hotels",
    count: 121,
    tone: "bg-emerald-100 text-emerald-700",
    icon: "home",
  },
  {
    name: "Business & Work",
    slug: "business-work",
    blurb: "Offices, coworking, jobs",
    count: 138,
    tone: "bg-amber-100 text-amber-700",
    icon: "briefcase",
  },
  {
    name: "Shopping",
    slug: "shopping",
    blurb: "Malls, markets, outlets",
    count: 106,
    tone: "bg-rose-100 text-rose-700",
    icon: "bag",
  },
  {
    name: "Education",
    slug: "education",
    blurb: "Schools, colleges, coaching",
    count: 78,
    tone: "bg-indigo-100 text-indigo-700",
    icon: "book",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    blurb: "Fitness, wellness, culture",
    count: 95,
    tone: "bg-teal-100 text-teal-700",
    icon: "sparkles",
  },
];

export const QUICK_SEARCHES = [
  "Rooftop restaurants",
  "PGs near Cyber City",
  "Weekend brunch",
  "Metro stations",
  "Coworking day pass",
  "Street food",
];

export const HERO_IMAGE = u("photo-1596176530529-78163a4f7af2", 2000);
