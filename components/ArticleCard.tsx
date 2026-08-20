import Link from 'next/link';
import Image from 'next/image';
import { timeAgo } from '@/lib/utils';
import { Icon } from './Icons';
import { Placeholder } from './Placeholder';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: Date;
  author?: { name: string };
  featuredImage?: { url: string; alt?: string | null } | null;
  viewCount?: number;
  category?: { name: string; slug: string };
  /** `horizontal` renders a compact list row instead of a stacked card */
  variant?: 'stacked' | 'horizontal';
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  publishedAt,
  author,
  featuredImage,
  viewCount,
  category,
  variant = 'stacked',
}: ArticleCardProps) {
  const image = featuredImage?.url;

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/article/${slug}`}
        className="group flex gap-4 sm:gap-5 rounded-2xl p-3 -m-3 hover:bg-ink-50 transition-colors"
      >
        <div className="relative w-28 sm:w-36 aspect-square shrink-0 rounded-xl overflow-hidden bg-ink-100">
          {image && (
            <Image
              src={image}
              alt={featuredImage?.alt || title}
              fill
              sizes="144px"
              className="object-cover zoom-target"
            />
          )}
        </div>
        <div className="min-w-0 py-0.5">
          {category && <span className="eyebrow text-brand-600">{category.name}</span>}
          <h3 className="mt-2 font-bold text-ink-950 text-[17px] leading-snug clamp-2 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="mt-1.5 text-sm text-ink-500 clamp-2 hidden sm:block">{excerpt}</p>
          )}
          <Meta author={author?.name} publishedAt={publishedAt} viewCount={viewCount} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${slug}`} className="group flex flex-col h-full">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-ink-100">
        {image ? (
          <Image
            src={image}
            alt={featuredImage?.alt || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover zoom-target"
          />
        ) : (
          <Placeholder name={title} label={category?.name} />
        )}
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur text-[11px] font-bold text-ink-900 shadow-sm">
            {category.name}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-bold text-ink-950 text-[17px] leading-snug clamp-2 group-hover:text-brand-600 transition-colors">
        {title}
      </h3>
      {excerpt && <p className="mt-2 text-sm text-ink-500 clamp-2 flex-grow">{excerpt}</p>}
      <Meta author={author?.name} publishedAt={publishedAt} viewCount={viewCount} />
    </Link>
  );
}

function Meta({
  author,
  publishedAt,
  viewCount,
}: {
  author?: string;
  publishedAt?: Date;
  viewCount?: number;
}) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-400">
      {author && <span className="font-semibold text-ink-500">{author}</span>}
      {author && publishedAt && <span aria-hidden="true">·</span>}
      {publishedAt && <span>{timeAgo(publishedAt)}</span>}
      {typeof viewCount === 'number' && viewCount > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="w-3.5 h-3.5" />
            {viewCount.toLocaleString()} views
          </span>
        </>
      )}
    </p>
  );
}
