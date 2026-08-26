import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './Icons';
import { Placeholder } from './Placeholder';
import type { OpenState } from '@/lib/opening-hours';

interface PlaceCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  placeType: string;
  area?: { name: string; slug: string };
  image?: { url: string; altText?: string };
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  cuisine?: string;
  /** Shown inline, knowing it is open is the point of a listing card. */
  openState?: OpenState;
}

export function PlaceCard({
  name,
  slug,
  description,
  placeType,
  area,
  image,
  rating,
  reviewCount,
  priceRange,
  cuisine,
  openState,
}: PlaceCardProps) {
  return (
    <Link
      href={`/place/${slug}`}
      className="group flex flex-col rounded-card overflow-hidden bg-card border border-line hover:shadow-lift hover:border-transparent transition-all"
    >
      <div className="relative aspect-[4/3] bg-card-2 overflow-hidden">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText || name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover zoom-target"
          />
        ) : (
          <Placeholder name={name} label={placeType} />
        )}

        {typeof rating === 'number' && rating > 0 && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-card/95 backdrop-blur text-xs font-bold text-fg shadow-sm">
            <Icon name="star" className="w-3.5 h-3.5 text-brand-500" />
            {rating.toFixed(1)}
            {typeof reviewCount === 'number' && reviewCount > 0 && (
              <span className="font-medium text-fg-subtle">({reviewCount})</span>
            )}
          </span>
        )}

        {placeType && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-pill bg-ink-950/75 backdrop-blur text-[11px] font-semibold text-white capitalize">
            {placeType}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-fg clamp-2 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>

        {cuisine && <p className="mt-1 text-sm text-fg-subtle">{cuisine}</p>}

        {description && (
          <p className="mt-2 text-sm text-fg-subtle clamp-2 flex-grow">{description}</p>
        )}

        {openState && openState.status !== 'unknown' && (
          <p
            className={`mt-2 text-xs font-semibold ${
              openState.status === 'closed' ? 'text-fg-subtle' : 'text-emerald-600'
            }`}
          >
            {openState.label}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs">
          {area ? (
            <span className="inline-flex items-center gap-1 text-fg-subtle">
              <Icon name="pin" className="w-3.5 h-3.5" />
              {area.name}
            </span>
          ) : (
            <span />
          )}
          {priceRange && (
            <span className="font-semibold text-fg-muted">{priceRange}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
