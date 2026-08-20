import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    include: { author: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Gurugram Dekho</title>
    <link>https://gurugramdekho.com</link>
    <description>Your guide to Gurugram/Gurgaon - restaurants, places, events, and local information</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
    ${articles
      .map(
        (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>https://gurugramdekho.com/article/${article.slug}</link>
      <guid>https://gurugramdekho.com/article/${article.slug}</guid>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      <description>${escapeXml(article.excerpt || (article.content ?? '').substring(0, 200))}</description>
      <author>${article.author.email}</author>
    </item>
    `
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
