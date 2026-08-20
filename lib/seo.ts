export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  robots?: string;
}

export function generateMetadata(seo: SEOMetadata): SEOMetadata {
  return {
    title: seo.title || 'Gurugram Dekho - Discover Gurgaon',
    description: seo.description || 'Your guide to Gurugram/Gurgaon - restaurants, places, events, and local information',
    keywords: seo.keywords || 'Gurugram, Gurgaon, local guide, restaurants, places',
    ogImage: seo.ogImage || '/og-image.jpg',
    ogType: seo.ogType || 'website',
    canonicalUrl: seo.canonicalUrl,
    robots: seo.robots || 'index, follow',
  };
}

export interface Article {
  title: string;
  description: string;
  image?: string;
  publishedAt?: Date;
  modifiedAt?: Date;
  author: string;
  url: string;
}

export function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || '/og-image.jpg',
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.modifiedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gurugram Dekho',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
  };
}

export interface LocalBusinessPlace {
  name: string;
  description?: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phone?: string;
  website?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  priceRange?: string;
  cuisines?: string[];
}

export function generateLocalBusinessSchema(place: LocalBusinessPlace) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant', // or modify based on place type
    name: place.name,
    description: place.description,
    image: place.image || '/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address,
      addressLocality: place.city,
      addressRegion: place.region,
      postalCode: place.postalCode,
      addressCountry: 'IN',
    },
    telephone: place.phone,
    url: place.url,
    website: place.website,
    ...(place.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: place.rating.toString(),
        reviewCount: place.reviewCount || 0,
      },
    }),
    ...(place.priceRange && { priceRange: place.priceRange }),
    ...(place.cuisines && { servesCuisine: place.cuisines }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gurugram Dekho',
    url: 'https://gurugramdekho.com',
    logo: 'https://gurugramdekho.com/logo.png',
    description: 'Your guide to Gurugram/Gurgaon - restaurants, places, events, and local information',
    sameAs: [
      'https://www.facebook.com/gurugramdekho',
      'https://www.instagram.com/gurugramdekho',
      'https://www.twitter.com/gurugramdekho',
    ],
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
